import { MikroORM } from "@mikro-orm/core";
import Code from "@services/service-voucher/src/code/entities/code";
import Hub from "@services/service-network/src/hub/entity";
import Hotel from "@services/service-network/src/hotel/entity";
import getVoucherCodeBlock from "@services/service-voucher/src/code/usecases/get-code";
import getHotelBlock from "@services/service-network/src/hotel/usecases/get-hotel";
import getHubBlock from "@services/service-network/src/hub/usecases/get-hub";
import getModifierOptionsBlock from "@services/service-menu/src/modifier/blocks/get-options-by-id";
import { Service } from "../../service/entity";
import {
  validate,
  BadRequestError,
  logger,
  getWebSocketService,
  WebSocketProvider,
  eventProvider,
  IWebsocketBroadcastMessageInput,
  WebSocketActionTypes,
  orderCreatedEvent
} from "@butlerhospitality/service-sdk";
import {
  Order,
  OrderClient,
  OrderDiscount,
  OrderMeta,
  OrderProduct,
  OrderCustomProduct,
  OrderProductModifier,
  OrderProductVoucher,
  OrderVoucher,
  IOrderPublish
} from "../entity";
import {
  IBaseOrderDependency,
  IBaseOrderInput,
  IBaseOrderOutput,
  IClient,
  IConstructCalculationInput,
  IProduct,
  ModifierOptionMap,
  VoucherMap
} from "../shared/interfaces";
import {
  calculateAndApplyPricesToOrder,
  validateDiscountCodePerClient,
  redeemPreFixeVouchers,
  redeemVoucher,
  redeemDiscountCode,
  applyVoucherToCalculationInput,
  applyDiscountToCalculationInput,
  validateHotelHasVouchersEnabled,
  validateDiscountCode,
  validateHotelWithHubAndRoomNumber,
  validateHotelHasMenu,
  validateProducts,
  validateVoucher,
  validateProductVouchers,
  validateProductVoucherRules,
  validatePayment,
  validateVoucherBelongsToHotel
} from "../shared/blocks";
import * as segment from "../shared/segment";
import ModifierOption from "@services/service-menu/src/modifier/entities/modifier-option";
import { BaseOrderInput } from "../shared/validators";
import { OrderCreationType, OrderSource, OrderStatus } from "../shared/enums";
import { initializeDependencyConnections } from "../../utils/util";
import { ENTITY, ORDER_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import { PaymentType } from "@butlerhospitality/shared";
import { getPaymentService, PaymentProvider } from "@butlerhospitality/service-sdk";
import { Discount } from "@services/service-discount/src/discount/entity";
import { OrderRepository } from "../repository";
import { OrderVoucherRepository } from "../repositories/voucher";
import { ServiceRepository } from "../../service/repository";
import { OrderDiscountRepository } from "../repositories/discount";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export interface ICreateOrderInput extends IBaseOrderInput {
  parentOrderId?: number
}

export interface ICreateOrderOutput extends IBaseOrderOutput {

}

export class CreateOrderInput extends BaseOrderInput implements ICreateOrderInput {
  @IsOptional()
  @IsInt()
  @IsPositive()
  parentOrderId?: number;
}

export interface ICreateOrderDependency extends IBaseOrderDependency {
}

function applyBasicToOrder(orderConnection: MikroORM) {
  return async (order: Order, input: ICreateOrderInput) => {
    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;
    const scheduledDate = input.scheduledDate ? new Date(input.scheduledDate) : null;
    const number = await orderRepository.generateOrderNumber(input.hotel.hubId, scheduledDate);

    order.status = input.scheduledDate ? OrderStatus.SCHEDULED : OrderStatus.PENDING;
    order.service = orderConnection.em.getRepository(Service).getReference(1);
    order.comment = input.comment;
    order.number = number;
    order.type = input.type;
    order.paymentType = input.paymentType;
    order.scheduledDate = scheduledDate;
    order.source = OrderSource.WEB;
  };
}

function applyParentToOrder(orderConnection: MikroORM) {
  return async (order: Order, parentOrderId: number) => {
    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;

    if (parentOrderId) {
      const parent = await orderRepository.getOneEntityOrFail(parentOrderId);

      orderRepository.assign(order, {
        parent
      });
    }
  };
}

function applyMetaToOrder(orderConnection: MikroORM, networkConnection: MikroORM) {
  return async (order: Order, calculationInput: IConstructCalculationInput, input: ICreateOrderInput) => {
    const orderMetaRepository = orderConnection.em.getRepository(OrderMeta);

    const hub = await getHubBlock({
      hubRepository: networkConnection.em.getRepository(Hub)
    })(input.hotel.hubId);

    const hotel = await getHotelBlock({
      hotelRepository: networkConnection.em.getRepository(Hotel)
    })(input.hotel.id);

    order.meta = orderMetaRepository.create({
      cutlery: input.cutlery,
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomNumber: input.hotel.roomNumber,
      hubId: hub.id,
      hubName: hub.name,
      hubColor: hub.color
    });

    Object.assign(calculationInput, {
      taxRate: hub.tax_rate,
      isTaxExempt: hotel.is_tax_exempt
    });
  };
}

function applyClientToOrder(orderConnection: MikroORM) {
  return async (order: Order, client: IClient) => {
    const orderClientRepository = orderConnection.em.getRepository(OrderClient);

    order.client = orderClientRepository.create({
      email: client.email,
      name: client.name,
      phoneNumber: client.phoneNumber
    });
  };
}

function applyProductsWithVouchersToOrder(
  orderConnection: MikroORM,
  menuConnection: MikroORM,
  voucherConnection: MikroORM
) {
  return async (order: Order, calculationInput: IConstructCalculationInput, input: ICreateOrderInput) => {
    const orderProductRepository = orderConnection.em.getRepository(OrderProduct);
    const orderCustomProductRepository = orderConnection.em.getRepository(OrderCustomProduct);

    const voucherMappings: VoucherMap[] = [];
    const modifierOptionMappings: ModifierOptionMap[] = [];
    const preFixeVouchers: Code[] = [];

    for (const product of input.products) {
      const productHasModifiers = product.options.length > 0;
      const productHasVoucher = !!product.codeId && !!product.code && !!product.ruleId;

      const orderProduct = orderProductRepository.create({
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        comment: product.comment,
        quantity: product.quantity,
        productId: product.productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice ?? product.price
      });

      if (productHasVoucher) {
        const voucher =
          await applyVoucherToProduct(orderConnection, voucherConnection)(orderProduct, product, voucherMappings);
        preFixeVouchers.push(voucher);
      }

      if (productHasModifiers) {
        await applyModifiersToProduct(orderConnection, menuConnection)(orderProduct, product, modifierOptionMappings);
      }

      order.products.add(orderProduct);
    }

    for (const product of input.customProducts) {
      const orderCustomProduct = orderCustomProductRepository.create({
        name: product.name,
        price: product.price,
        comment: product.comment,
        quantity: product.quantity
      });

      order.customProducts.add(orderCustomProduct);
    }

    Object.assign(calculationInput, {
      preFixeVouchers,
      products: order.products.getItems(),
      customProducts: order.customProducts.getItems()
    });
  };
}

function applyVoucherToProduct(orderConnection: MikroORM, voucherConnection: MikroORM) {
  return async (orderProduct: OrderProduct, productInput: IProduct, voucherMappings: VoucherMap[]): Promise<Code> => {
    const productVoucherRepository = orderConnection.em.getRepository(OrderProductVoucher);

    if (!voucherMappings.some((a) => a.id === productInput.codeId)) {
      const voucherCode = await getVoucherCodeBlock({
        codeRepository: voucherConnection.em.getRepository(Code)
      })(productInput.codeId);

      voucherMappings.push({
        id: voucherCode.id,
        code: voucherCode,
        rule: voucherCode.program.rules.getItems().find((a) => a.id === productInput.ruleId)
      });
    }

    const voucherMapping = voucherMappings.find((mapping) => mapping.id === productInput.codeId);

    orderProduct.vouchers.add(productVoucherRepository.create({
      ruleId: voucherMapping.rule.id,
      ruleMaxItemPrice: voucherMapping.rule.max_price,
      voucherCode: voucherMapping.code.code,
      voucherCodeId: voucherMapping.code.id
    }));

    return voucherMapping.code;
  };
}

function applyModifiersToProduct(orderConnection: MikroORM, menuConnection: MikroORM) {
  return async (orderProduct: OrderProduct, productInput: IProduct, modifierOptionMappings: ModifierOptionMap[]) => {
    const productModifierRepository = orderConnection.em.getRepository(OrderProductModifier);
    const modifierMappingIds = modifierOptionMappings.map((mapping) => mapping.id);

    const mappingDiff = productInput.options
      .filter((optionId) => !modifierMappingIds.includes(optionId));

    if (mappingDiff.length > 0) {
      const modifierOptions = await getModifierOptionsBlock({
        modifierOptionRepository: menuConnection.em.getRepository(ModifierOption)
      })(mappingDiff);

      for (const modifierOption of modifierOptions) {
        modifierOptionMappings.push({
          id: modifierOption.id,
          option: modifierOption
        });
      }
    }

    const modifierOptions = modifierOptionMappings
      .filter((mapping) => productInput.options.includes(mapping.id))
      .map((mapping) => mapping.option);

    for (const modifierOption of modifierOptions) {
      orderProduct.modifiers.add(productModifierRepository.create({
        modifierId: modifierOption.modifier.id,
        modifierName: modifierOption.modifier.name,
        modifierOptionId: modifierOption.id,
        modifierOptionName: modifierOption.name,
        modifierOptionPrice: modifierOption.price,
        quantity: productInput.quantity
      }));
    }
  };
}

function applyVoucherToOrder(orderConnection: MikroORM) {
  return async (order: Order, voucherCode: Code): Promise<Code> => {
    const orderVoucherRepository =
      orderConnection.em.getRepository(OrderVoucher) as OrderVoucherRepository;
    const serviceRepository =
      orderConnection.em.getRepository(Service) as ServiceRepository;

    order.vouchers.add(orderVoucherRepository.create({
      amount: order.totalVoucherPrice,
      codeId: voucherCode.id,
      code: voucherCode.code,
      programId: voucherCode.program.id,
      service: serviceRepository.getReference(1),
      type: voucherCode.program.type
    }));

    return voucherCode;
  };
}

function applyDiscountToOrder(orderConnection: MikroORM) {
  return async (order: Order, discountCode: Discount) => {
    const orderDiscountRepository =
      orderConnection.em.getRepository(OrderDiscount) as OrderDiscountRepository;
    const serviceRepository =
      orderConnection.em.getRepository(Service) as ServiceRepository;

    const amountUsed = order.receiptAmount > discountCode.amount ? discountCode.amount : order.receiptAmount;

    order.discounts.add(orderDiscountRepository.create({
      discountCodeId: discountCode.id,
      code: discountCode.code,
      type: discountCode.type,
      amount: discountCode.amount,
      amountUsed: amountUsed,
      service: serviceRepository.getReference(1)
    }));

    return discountCode;
  };
}

export default (dependency: ICreateOrderDependency) => {
  return async (input: ICreateOrderInput): Promise<ICreateOrderOutput> => {
    await validate(CreateOrderInput, input, dependency.validate);

    const orderConnection = dependency.connection;
    const {
      menuConnection,
      voucherConnection,
      networkConnection,
      discountConnection
    } = await initializeDependencyConnections(dependency.tenant);

    const orderContainsVoucher = input.voucher?.id && input.voucher?.code;
    const orderContainsDiscount = input.discount?.id && input.discount?.code;
    const productsContainVoucher = input.products.some((a) => a.code && a.codeId && a.ruleId);

    const isCreditCardPayment = input.paymentType === PaymentType.CREDIT_CARD;

    if (orderContainsVoucher && orderContainsDiscount) {
      throw new BadRequestError("You cannot apply both voucher and discount to an order.");
    }

    if (orderContainsVoucher && productsContainVoucher) {
      throw new BadRequestError("You cannot apply vouchers to both products and the order itself.");
    }

    if (orderContainsDiscount && productsContainVoucher) {
      throw new BadRequestError("You cannot apply both discount and product vouchers to an order.");
    }

    let orderType: OrderCreationType;

    if (orderContainsVoucher) {
      orderType = OrderCreationType.WITH_VOUCHER;
    } else if (orderContainsDiscount) {
      orderType = OrderCreationType.WITH_DISCOUNT;
    } else if (productsContainVoucher) {
      orderType = OrderCreationType.WITH_PRE_FIXE;
    } else {
      orderType = OrderCreationType.NORMAL;
    }

    const promises: Promise<boolean | void>[] = [
      validateHotelWithHubAndRoomNumber(networkConnection)(input.hotel, input.paymentType),
      validateHotelHasMenu(menuConnection)(input.hotel),
      validateProducts(menuConnection)(input.hotel, input.products)
    ];

    if (orderContainsVoucher) {
      promises.push(validateVoucher(voucherConnection)(input.voucher));
      promises.push(validateHotelHasVouchersEnabled(networkConnection)(input.hotel));
      promises.push(validateVoucherBelongsToHotel(voucherConnection)(input.voucher, input.hotel));
    }

    if (orderContainsDiscount) {
      promises.push(
        validateDiscountCode(
          discountConnection
        )(
          input.discount,
          input.hotel.hubId,
          input.hotel.hubName
        )
      );
    }

    if (productsContainVoucher) {
      promises.push(validateProductVouchers(voucherConnection)(input.products));
      promises.push(validateProductVoucherRules(voucherConnection)(input.products));
    }

    if (isCreditCardPayment) {
      promises.push(validatePayment(input.paymentGateway, input.nonce));
    }

    await Promise.all(promises);

    /*
      From now on, we assume that all the order details have been validated from the previous `Promise.all()` block
    */

    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;

    const order = orderRepository.create({});

    const calculationInput: IConstructCalculationInput = {
      products: [],
      customProducts: [],
      taxRate: 0.0,
      isTaxExempt: false,
      totalVoucherPrice: 0.0
    };

    // TODO: Check max orders per window
    await orderConnection.em.begin();
    await discountConnection.em.begin();
    await voucherConnection.em.begin();

    try {
      await applyBasicToOrder(orderConnection)(order, input);
      await applyClientToOrder(orderConnection)(order, input.client);
      await applyMetaToOrder(orderConnection, networkConnection)(order, calculationInput, input);
      await applyParentToOrder(orderConnection)(order, input.parentOrderId);
      await applyProductsWithVouchersToOrder(
        orderConnection,
        menuConnection,
        voucherConnection
      )(
        order,
        calculationInput,
        input
      );

      await applyVoucherToCalculationInput(voucherConnection)(calculationInput, input.voucher);
      await applyDiscountToCalculationInput(discountConnection)(calculationInput, input.discount, input.client);

      calculateAndApplyPricesToOrder(order, input, calculationInput, orderType);

      switch (orderType) {
      case OrderCreationType.WITH_VOUCHER:
        await applyVoucherToOrder(orderConnection)(order, calculationInput.voucher);
        await redeemVoucher(voucherConnection)(input.voucher, order.totalVoucherPrice);
        break;
      case OrderCreationType.WITH_DISCOUNT:
        await validateDiscountCodePerClient(orderRepository)(order, calculationInput.discount);
        await applyDiscountToOrder(orderConnection)(order, calculationInput.discount);
        await redeemDiscountCode(
          discountConnection
        )(
          input.discount,
          order.receiptAmount > calculationInput.discount.amount ?
            calculationInput.discount.amount :
            order.receiptAmount,
          input.client.phoneNumber
        );
        break;
      case OrderCreationType.WITH_PRE_FIXE:
        await redeemPreFixeVouchers(voucherConnection)(input.products, order.totalVoucherPrice);
        break;
      default:
        break;
      }

      if (order.paymentType === PaymentType.CREDIT_CARD) {
        if (!input.nonce) {
          throw new BadRequestError("Cannot create order, payment token is missing.");
        }

        const payment = await getPaymentService(PaymentProvider.SQUARE).pay({
          nonce: input.nonce,
          amount: order.receiptAmount,
          clientName: order.client.name,
          clientEmail: order.client.email,
          clientPhoneNumber: order.client.phoneNumber
        });

        order.transactionId = payment.transactionId;
      }

      orderConnection.em.persist(order);

      await orderConnection.em.commit();
      await voucherConnection.em.commit();
      await discountConnection.em.commit();
    } catch (error) {
      await orderConnection.em.rollback();
      await voucherConnection.em.rollback();
      await discountConnection.em.rollback();

      logger.error("An error happened while trying to create the order.");
      throw error;
    }

    // TODO: Charge to room handling
    // TODO: Make payment (if necessary) and apply transaction_id to the order
    // TODO: Send SMS using AWS SMS (or twilio)
    // TODO: Send email receipt and track...

    if (order.source === OrderSource.PHONE) {
      await segment.orderCreated(order.client.phoneNumber, {
        clientName: order.client.name,
        hotelId: order.meta.hotelId,
        hotelName: order.meta.hotelName,
        orderId: order.id,
        createdDate: order.created_at,
        phoneNumber: order.client.phoneNumber,
        source: order.source
      });
    }

    await eventProvider.client().publish<IOrderPublish>(
      SNS_TOPIC.ORDER.ORDER, ORDER_EVENT.CREATED, null, {
        ...order,
        entity: ENTITY.ORDER.ORDER
      });

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderCreatedEvent].key,
      id: order.id
    };
    await socketService.broadcast(broadCastParameters);

    return orderRepository.applyRelationsToOrder(order);
  };
};
