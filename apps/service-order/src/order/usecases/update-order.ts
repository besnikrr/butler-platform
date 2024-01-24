import { BadRequestError, eventProvider, getPaymentService, getWebSocketService, IWebsocketBroadcastMessageInput, logger, orderUpdatedEvent, PaymentProvider, validate, WebSocketActionTypes, WebSocketProvider } from "@butlerhospitality/service-sdk";
import {
  IsInt,
  IsNotEmpty,
  IsPositive
} from "class-validator";

import getVoucherCodeBlock from "@services/service-voucher/src/code/usecases/get-code";
import getDiscountCodeBlock from "@services/service-discount/src/discount/blocks/get-by-id";
import getModifierOptionsBlock from "@services/service-menu/src/modifier/blocks/get-options-by-id";

import getHotelBlock from "@services/service-network/src/hotel/usecases/get-hotel";
import getHubBlock from "@services/service-network/src/hub/usecases/get-hub";
import {
  IOrderPublish,
  Order,
  OrderClient,
  OrderCustomProduct,
  OrderDiscount,
  OrderMeta,
  OrderProduct,
  OrderProductModifier,
  OrderProductVoucher,
  OrderVoucher
} from "../entity";
import {
  IBaseOrderDependency,
  IBaseOrderInput,
  IBaseOrderOutput,
  IClient,
  ICustomProduct,
  IDiscount,
  IProduct,
  IConstructCalculationInput,
  IVoucher,
  ModifierOptionMap,
  VoucherMap
} from "../shared/interfaces";
import { Service } from "../../service/entity";
import { BaseOrderInput } from "../shared/validators";
import { initializeDependencyConnections } from "../../utils/util";
import { OrderCreationType, OrderSource, OrderStatus } from "../shared/enums";
import { EntityRepository, MikroORM, wrap } from "@mikro-orm/core";
import {
  applyDiscountToCalculationInput,
  applyVoucherToCalculationInput,
  calculateAndApplyPricesToOrder,
  clearVoucher,
  redeemDiscountCode,
  redeemPreFixeVouchers,
  redeemVoucher,
  validateDiscountCode,
  validateDiscountCodePerClient,
  validateHotelHasMenu,
  validateHotelHasVouchersEnabled,
  validateHotelWithHubAndRoomNumber,
  validatePayment,
  validateProducts,
  validateProductVoucherRules,
  validateProductVouchers,
  validateVoucher,
  validateVoucherBelongsToHotel
} from "../shared/blocks";
import Code from "@services/service-voucher/src/code/entities/code";
import ModifierOption from "@services/service-menu/src/modifier/entities/modifier-option";
import { ENTITY, ORDER_EVENT, PaymentType, SNS_TOPIC } from "@butlerhospitality/shared";
import Discount from "@services/service-discount/src/discount/entities/discount";
import Hub from "@services/service-network/src/hub/entity";
import Hotel from "@services/service-network/src/hotel/entity";
import { OrderRepository } from "../repository";
import { OrderDiscountRepository } from "../repositories/discount";
import { ServiceRepository } from "../../service/repository";
import { OrderVoucherRepository } from "../repositories/voucher";
import { OrderProductRepository, OrderCustomProductRepository } from "../repositories/product";
export interface IUpdateOrderInput extends IBaseOrderInput {
  version: number;
}

export interface IUpdateOrderOutput extends IBaseOrderOutput {

}

export class UpdateOrderInput extends BaseOrderInput implements IUpdateOrderInput {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  version!: number;
}

export interface IUpdateOrderDependency extends IBaseOrderDependency {

}

function applyBasicToOrder(orderConnection: MikroORM) {
  return async (order: Order, input: IUpdateOrderInput) => {
    order.comment = input.comment;
    order.type = input.type;
    order.paymentType = input.paymentType;
    order.source = OrderSource.WEB;
    order.service = orderConnection.em.getRepository(Service).getReference(1);
  };
}

function applyMetaToOrder(orderConnection: MikroORM, networkConnection: MikroORM) {
  return async (order: Order, calculationInput: IConstructCalculationInput, input: IUpdateOrderInput) => {
    const orderMetaRepository = orderConnection.em.getRepository(OrderMeta);

    const hub = await getHubBlock({
      hubRepository: networkConnection.em.getRepository(Hub)
    })(input.hotel.hubId);

    const hotel = await getHotelBlock({
      hotelRepository: networkConnection.em.getRepository(Hotel)
    })(input.hotel.id);

    orderMetaRepository.assign(order.meta, {
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

    orderClientRepository.assign(order.client, {
      email: client.email,
      name: client.name,
      phoneNumber: client.phoneNumber
    });
  };
}

function applyScheduleChanges(orderConnection: MikroORM) {
  return async (order: Order, input: IUpdateOrderInput) => {
    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;

    const scheduledDate = input.scheduledDate ? new Date(input.scheduledDate) : null;

    const hasHubChange = order.meta.hubId !== input.hotel.hubId;
    const isOrderNowScheduled =
      !order.scheduledDate && !!input.scheduledDate && order.status === OrderStatus.PENDING;
    const orderScheduleDateChanged =
      !!input.scheduledDate &&
      order.scheduledDate.getTime() !== scheduledDate.getTime() &&
      order.status === OrderStatus.SCHEDULED;
    const orderNeedsNewNumber = hasHubChange || isOrderNowScheduled || orderScheduleDateChanged;

    if (orderNeedsNewNumber) {
      order.number = await orderRepository.generateOrderNumber(input.hotel.hubId, scheduledDate);
    }

    if (scheduledDate) {
      order.status = OrderStatus.SCHEDULED;
    }
  };
}

const handleProductChanges = (
  orderProductRepository: OrderProductRepository,
  product: IProduct,
  orderProducts: OrderProduct[]
) => {
  let orderProduct: OrderProduct;

  if (product.id) {
    orderProduct = orderProductRepository.getReference(product.id);
    wrap(orderProduct).assign(product);

    orderProducts.push(orderProduct);
  } else {
    const newOrderProduct = orderProductRepository.create({
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      comment: product.comment,
      quantity: product.quantity,
      productId: product.productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice ?? product.price
    });

    orderProduct = newOrderProduct;
    orderProducts.push(newOrderProduct);
  }

  return orderProduct;
};

const handleCustomProductChanges = (
  orderCustomProductRepository: EntityRepository<OrderCustomProduct>,
  customProduct: ICustomProduct,
  orderCustomProducts: OrderCustomProduct[]
) => {
  if (customProduct.id) {
    const orderCustomProduct = orderCustomProductRepository.getReference(customProduct.id);
    wrap(orderCustomProduct).assign(customProduct);
    orderCustomProducts.push(orderCustomProduct);
  } else {
    const orderCustomProduct = orderCustomProductRepository.create({
      name: customProduct.name,
      price: customProduct.price,
      comment: customProduct.comment,
      quantity: customProduct.quantity
    });

    orderCustomProducts.push(orderCustomProduct);
  }
};

function applyProductsWithVouchersToOrder(
  orderConnection: MikroORM,
  menuConnection: MikroORM,
  voucherConnection: MikroORM
) {
  return async (order: Order, calculationInput: IConstructCalculationInput, input: IUpdateOrderInput) => {
    const orderProductRepository =
      orderConnection.em.getRepository(OrderProduct) as OrderProductRepository;
    const orderCustomProductRepository =
      orderConnection.em.getRepository(OrderCustomProduct) as OrderCustomProductRepository;

    const currentOrderProducts = order.products.getItems();
    const voucherMappings: VoucherMap[] = [];
    const modifierOptionMappings: ModifierOptionMap[] = [];
    const preFixeVouchers: Code[] = [];
    const orderProducts = [];
    const orderCustomProducts = [];

    for (const product of input.products) {
      const oldProduct = product.id && currentOrderProducts.find((orderProduct) => orderProduct.id === product.id);

      const hadVoucher = oldProduct?.vouchers.length > 0;
      const hasVoucher = !!product.codeId && !!product.code && !!product.ruleId;

      const orderProduct = handleProductChanges(orderProductRepository, product, orderProducts);

      if (hadVoucher) {
        await clearVoucher(
          voucherConnection
        )(
          oldProduct.vouchers[0].voucherCodeId
        );

        oldProduct.vouchers.remove(...oldProduct.vouchers);
      }

      if (hasVoucher) {
        const voucher =
          await applyVoucherToProduct(orderConnection, voucherConnection)(orderProduct, product, voucherMappings);

        preFixeVouchers.push(voucher);
      }

      await applyModifiersToProduct(orderConnection, menuConnection)(orderProduct, product, modifierOptionMappings);
    }

    for (const customProduct of input.customProducts) {
      handleCustomProductChanges(orderCustomProductRepository, customProduct, orderCustomProducts);
    }

    wrap(order).assign({
      products: orderProducts,
      customProducts: orderCustomProducts
    }, {
      mergeObjects: true
    });

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

    const productModifierOptionIds = orderProduct.modifiers.getItems().map((a) => a.modifierOptionId);

    const modifierOptionsToAdd = productInput.options
      .filter((optionId) => !productModifierOptionIds.includes(optionId));

    const modifierOptionsToRemove = productModifierOptionIds
      .filter((optionId) => !productInput.options.includes(optionId));

    for (const modifierOptionId of modifierOptionsToAdd) {
      const modifierOption = modifierOptionMappings.find((mapping) => mapping.id === modifierOptionId);

      orderProduct.modifiers.add(productModifierRepository.create({
        modifierId: modifierOption.option.modifier.id,
        modifierName: modifierOption.option.modifier.name,
        modifierOptionId: modifierOption.option.id,
        modifierOptionName: modifierOption.option.name,
        modifierOptionPrice: modifierOption.option.price,
        quantity: productInput.quantity
      }));
    }

    for (const modifierOptionId of modifierOptionsToRemove) {
      const modifierReference = productModifierRepository.getReference(
        orderProduct.modifiers.getItems().find((a) => a.modifierOptionId === modifierOptionId).id
      );

      orderProduct.modifiers.remove(modifierReference);
    }
  };
}

function applyVoucherToOrder(orderConnection: MikroORM, voucherConnection: MikroORM) {
  return async (order: Order, voucher: IVoucher) => {
    const hadVoucher = order.vouchers.length > 0;
    const hasVoucher = voucher?.id && voucher?.code;
    const sameVoucher = hadVoucher && hasVoucher && order.vouchers[0].codeId === voucher.id;

    if (hadVoucher) {
      await clearVoucher(
        voucherConnection
      )(
        order.vouchers[0].codeId,
        order.vouchers[0].amount
      );

      if (!sameVoucher) {
        order.vouchers.remove(...order.vouchers);
      }
    }

    if (hasVoucher) {
      if (sameVoucher) {
        order.vouchers[0].amount = order.totalVoucherPrice;
      } else {
        const orderVoucherRepository =
        orderConnection.em.getRepository(OrderVoucher) as OrderVoucherRepository;
        const serviceRepository =
        orderConnection.em.getRepository(Service) as ServiceRepository;

        const voucherCode = await getVoucherCodeBlock({
          codeRepository: voucherConnection.em.getRepository(Code)
        })(voucher.id);

        order.vouchers.add(orderVoucherRepository.create({
          amount: order.totalVoucherPrice,
          codeId: voucherCode.id,
          code: voucherCode.code,
          programId: voucherCode.program.id,
          service: serviceRepository.getReference(1),
          type: voucherCode.program.type
        }));
      }
    }
  };
}

function applyDiscountToOrder(orderConnection: MikroORM, discountConnection: MikroORM) {
  return async (order: Order, discount: IDiscount) => {
    const hadDiscount = order.discounts.length > 0;
    const hasDiscount = discount?.id && discount?.code;

    const sameDiscount = hadDiscount && hasDiscount && order.discounts[0].discountCodeId === discount.id;

    if (hadDiscount) {
      // await clearDiscountCode(
      //   discountConnection
      // )(
      //   order.vouchers[0].codeId,
      //   order.vouchers[0].amount
      // );

      if (!sameDiscount) {
        order.discounts.remove(...order.discounts);
      }
    }

    if (hasDiscount) {
      if (sameDiscount) {
        order.discounts[0].amountUsed = order.receiptAmount > order.discounts[0].amount ?
          order.discounts[0].amount :
          order.receiptAmount;
      } else {
        const orderDiscountRepository =
        orderConnection.em.getRepository(OrderDiscount) as OrderDiscountRepository;
        const serviceRepository =
        orderConnection.em.getRepository(Service) as ServiceRepository;

        const discountCode = await getDiscountCodeBlock({
          discountRepository: discountConnection.em.getRepository(Discount)
        })(discount.id);

        order.discounts.add(orderDiscountRepository.create({
          discountCodeId: discountCode.id,
          code: discountCode.code,
          type: discountCode.type,
          amount: discountCode.amount,
          amountUsed: order.receiptAmount > discountCode.amount ? discountCode.amount : order.receiptAmount,
          service: serviceRepository.getReference(1)
        }));
      }
    }
  };
}

function applyPriceChanges(orderConnection: MikroORM) {
  return async (prevOrder: Order, order: Order) => {
    const orderAmountChanged = prevOrder.grandTotal !== order.grandTotal;
    const updatePaymentRequired = prevOrder.transactionId && orderAmountChanged;
    const createPaymentRequired = prevOrder.transactionId == null &&
      order.paymentType == PaymentType.CREDIT_CARD &&
      order.grandTotal > 0;
    const updateRoomChargeRequired = order.paymentType == PaymentType.CHARGE_TO_ROOM &&
      orderAmountChanged &&
      !!order.meta.pmsId &&
      prevOrder.status == OrderStatus.DELIVERED;

    if (updatePaymentRequired) {
      const payment = await getPaymentService(PaymentProvider.SQUARE).update({
        amount: order.grandTotal,
        paymentId: prevOrder.transactionId,
        tip: order.tip
      });

      order.transactionId = payment.id;
    } else if (createPaymentRequired) {
      await getPaymentService(PaymentProvider.SQUARE).pay({
        amount: order.grandTotal,
        clientEmail: order.client.email,
        clientName: order.client.name,
        clientPhoneNumber: order.client.phoneNumber,
        nonce: "", // TODO get source id from frontend
        tip: order.tip
      });
    } else if (updateRoomChargeRequired) {
      // TODO pms room charge update
    }
  };
}

export default (dependency: IUpdateOrderDependency) => {
  return async (id: number, input: IUpdateOrderInput): Promise<IUpdateOrderOutput> => {
    await validate(UpdateOrderInput, input, dependency.validate);

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
      promises.push(validatePayment(input?.paymentGateway, input?.nonce));
    }

    await Promise.all(promises);

    /*
      From now on, we assume that all the order details have been validated from the previous `Promise.all()` block
    */

    const orderRepository = orderConnection.em.getRepository(Order) as OrderRepository;
    const order = await orderRepository.getOrderWithRelations(id, input.version);
    // TODO: Check max orders per window

    const calculationInput: IConstructCalculationInput = {
      products: [],
      customProducts: [],
      taxRate: 0.0,
      isTaxExempt: false,
      totalVoucherPrice: order.totalVoucherPrice
    };

    await orderConnection.em.begin();
    await discountConnection.em.begin();
    await voucherConnection.em.begin();

    try {
      await applyBasicToOrder(orderConnection)(order, input);
      await applyClientToOrder(orderConnection)(order, input.client);
      await applyMetaToOrder(orderConnection, networkConnection)(order, calculationInput, input);
      await applyScheduleChanges(orderConnection)(order, input);

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

      await applyVoucherToOrder(orderConnection, voucherConnection)(order, input.voucher);
      await applyDiscountToOrder(orderConnection, discountConnection)(order, input.discount);

      // const prevOrder = Object.assign({}, order);
      // await applyPriceChanges(orderConnection)(prevOrder, order);

      switch (orderType) {
      case OrderCreationType.WITH_VOUCHER:
        await redeemVoucher(voucherConnection)(input.voucher, order.totalVoucherPrice);
        break;
      case OrderCreationType.WITH_DISCOUNT:
        await validateDiscountCodePerClient(orderRepository)(order, calculationInput.discount);
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
          throw new BadRequestError("Cannot create order, payment token is missing");
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

      await orderConnection.em.commit();
      await voucherConnection.em.commit();
      await discountConnection.em.commit();
    } catch (error) {
      await orderConnection.em.rollback();
      await voucherConnection.em.rollback();
      await discountConnection.em.rollback();

      logger.error("An error happened while trying to update the order.");
      throw error;
    }

    // TODO: Compare amount and take necessary actions if amount changes

    // TODO: Charge to room handling
    // TODO: Notify food carrier (conditionally)
    // TODO: Make payment (if necessary) and apply transaction_id to the order
    // TODO: Send SMS using AWS SMS (or twilio)
    // TODO: Send email receipt and track...
    // TODO: Publish to SNS

    await eventProvider.client().publish<IOrderPublish>(
      SNS_TOPIC.ORDER.ORDER, ORDER_EVENT.UPDATED, null, {
        ...order,
        entity: ENTITY.ORDER.ORDER
      });

    const socketService = getWebSocketService(WebSocketProvider.APIGATEWAY);
    const broadCastParameters: IWebsocketBroadcastMessageInput = {
      action: WebSocketActionTypes[orderUpdatedEvent].key,
      id: id
    };
    await socketService.broadcast(broadCastParameters);

    return orderRepository.applyRelationsToOrder(order);
  };
};
