import { MikroORM, wrap } from "@mikro-orm/core";
import getVoucherCodeBlock from "@services/service-voucher/src/code/usecases/get-code";
import redeemVoucherBlock from "@services/service-voucher/src/code/blocks/redeem-voucher";
import clearCodeBlock from "@services/service-voucher/src/code/blocks/clear-code";
import getDiscountCodeWithAmountUsedBlock from "@services/service-discount/src/discount/blocks/get-with-amount-used";
import redeemDiscountBlock from "@services/service-discount/src/discount/blocks/redeem-discount";
import validateMenuHotelBlock from "@services/service-menu/src/menu/blocks/validate-menu-hotel";
import validateProductsBlock from "@services/service-menu/src/menu/blocks/validate-products";
import validateVouchersBlock from "@services/service-voucher/src/code/blocks/validate-vouchers";
import validateDiscountCodeBlock from "@services/service-discount/src/discount/blocks/validate-discount";
import validateProductVoucherRulesBlock from "@services/service-voucher/src/rule/blocks/validate-voucher-rule";
import validateVoucherBelongsToHotelBlock from "@services/service-voucher/src/code/blocks/validate-voucher-hotel";
import validateHotelHubAndRoomNumberBlock
  from "@services/service-network/src/hotel/blocks/validate-hotel-hub-room-number";
import validateHotelHasVouchersEnabledBlock
  from "@services/service-network/src/hotel/blocks/validate-hotel-has-vouchers-enabled";
import Hotel from "@services/service-voucher/src/hotel/entities/hotel";
import Discount from "@services/service-discount/src/discount/entities/discount";
import Code from "@services/service-voucher/src/code/entities/code";
import { Order } from "../entity";
import { OrderRepository } from "../repository";
import { IDiscount, IProduct, IConstructCalculationInput, IVoucher, IHotel, IClient } from "./interfaces";
import {
  calculate,
  IOrderCalculationDiscount,
  IOrderCalculationInput,
  IOrderCalculationOutput,
  IOrderCalculationVoucher,
  IOrderCustomItem,
  IOrderItem,
  IOrderModifier
} from "../../../utils/calculation";
import { OrderCreationType, PaymentGateway } from "./enums";
import { DiscountUsage, PaymentType, PriceMeasurementType } from "@butlerhospitality/shared";
import { BadRequestError, CustomEntityRepository, logger } from "@butlerhospitality/service-sdk";
import { formatMoney } from "../../utils/util";
import { DiscountClientRepository, DiscountRepository } from "@services/service-discount/src/discount/repository";
import { DiscountClient } from "@services/service-discount/src/discount/entity";
import { OrderInput } from "./types";
import { CodeRepository } from "@services/service-voucher/src/code/repository";

export const applyVoucherToCalculationInput = (voucherConnection: MikroORM) =>{
  return async (calculationInput: IConstructCalculationInput, voucher: IVoucher) => {
    if (voucher?.id) {
      const voucherCode = await getVoucherCodeBlock({
        codeRepository: voucherConnection.em.getRepository(Code)
      })(voucher.id);

      Object.assign(calculationInput, {
        voucher: voucherCode
      });
    }
  };
};

export const applyDiscountToCalculationInput = (discountConnection: MikroORM) => {
  return async (calculationInput: IConstructCalculationInput, discount: IDiscount, client: IClient) => {
    if (discount?.id) {
      const discountCode = await getDiscountCodeWithAmountUsedBlock({
        discountRepository: discountConnection.em.getRepository(Discount)
      })(discount.code, client.phoneNumber);

      Object.assign(calculationInput, {
        discount: discountCode
      });
    }
  };
};

export const redeemVoucher = (voucherConnection: MikroORM) => {
  return async (voucher: IVoucher, amount: number) => {
    await redeemVoucherBlock({
      codeRepository: voucherConnection.em.getRepository(Code) as CustomEntityRepository<Code>
    })(voucher.id, amount);
  };
};

export const redeemPreFixeVouchers = (voucherConnection: MikroORM) => {
  return async (products: IProduct[], amount: number) => {
    const productsWithVoucher = products.filter((product) => !!product.codeId && !!product.code && !!product.ruleId);
    const voucherCodes = [...new Set(productsWithVoucher.map((a) => a.codeId))];

    await redeemVoucherBlock({
      codeRepository: voucherConnection.em.getRepository(Code) as CustomEntityRepository<Code>
    })(voucherCodes, amount);
  };
};

export const redeemDiscountCode = (discountConnection: MikroORM) => {
  return async (discount: IDiscount, amountUsed: number, clientPhoneNumber: string) => {
    await redeemDiscountBlock({
      discountRepository:
        discountConnection.em.getRepository(Discount) as DiscountRepository,
      discountClientRepository:
        discountConnection.em.getRepository(DiscountClient) as DiscountClientRepository
    })(discount.id, amountUsed, clientPhoneNumber);
  };
};

export const clearVoucher = (voucherConnection: MikroORM) => {
  return async (codeId: number, amount?: number) => {
    const codeRepository = voucherConnection.em.getRepository(Code) as CodeRepository;

    await clearCodeBlock({ codeRepository })({
      codeIds: [codeId],
      amount: amount
    });
  };
};

export const validateHotelWithHubAndRoomNumber = (networkConnection: MikroORM) => {
  return async (hotel: IHotel, paymentType: PaymentType) => {
    return validateHotelHubAndRoomNumberBlock({
      connection: networkConnection
    })({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hubId: hotel.hubId,
      hubName: hotel.hubName,
      menuId: hotel.menuId,
      roomNumber: hotel.roomNumber,
      paymentType: paymentType
    });
  };
};

export const validateHotelHasMenu = (menuConnection: MikroORM) => {
  return async (hotel: IHotel) => {
    return validateMenuHotelBlock({
      connection: menuConnection
    })({
      hotelId: hotel.id,
      menuId: hotel.menuId
    });
  };
};

export const validateProducts = (menuConnection: MikroORM) => {
  return async (hotel: IHotel, products: IProduct[]) => {
    return validateProductsBlock({
      connection: menuConnection
    })({
      menuId: hotel.menuId,
      hubId: hotel.hubId,
      products
    });
  };
};

export const validateProductVouchers = (voucherConnection: MikroORM) => {
  return async (products: IProduct[]) => {
    const productsWithVoucher = products.filter((product) => !!product.codeId && !!product.code && !!product.ruleId);

    await validateVouchersBlock({
      connection: voucherConnection
    })({
      vouchers: productsWithVoucher.map((product) => ({
        id: product.codeId,
        code: product.code
      }))
    });
  };
};

export const validateProductVoucherRules = (voucherConnection: MikroORM) => {
  return async (products: IProduct[]) => {
    const productsWithVoucher = products.filter((product) => !!product.codeId && !!product.code && !!product.ruleId);

    await validateProductVoucherRulesBlock({
      connection: voucherConnection
    })({
      products: productsWithVoucher
    });
  };
};
export const validateVoucher = (voucherConnection: MikroORM) => {
  return async (voucher: IVoucher) => {
    return validateVouchersBlock({
      connection: voucherConnection
    })({
      vouchers: voucher
    });
  };
};

export const validateDiscountCode = (voucherConnection: MikroORM) => {
  return async (discount: IDiscount, hubId: number, hubName: string) => {
    await validateDiscountCodeBlock({
      connection: voucherConnection
    })({
      discount: {
        ...discount,
        hub: {
          id: hubId,
          name: hubName
        }
      }
    });
  };
};

// TODO
// https://linear.app/butlerhospitality/issue/SQU5-344/validate-alcohol-requirements-tbd
// function validateAlcoholRequirements(products: IProduct[]) {
//   throw new Error("Function not implemented.");
// }

export const validatePayment = async (paymentGateway: PaymentGateway, nonce: string) => {
  if (paymentGateway !== PaymentGateway.SQUARE) {
    throw new BadRequestError("Invalid payment gateway.");
  }
  if (!nonce) {
    throw new BadRequestError("Nonce is required for square credit card payment.");
  }

  return true;
};

export const validateHotelHasVouchersEnabled = (networkConnection: MikroORM) => {
  return async (hotel: IHotel) => {
    return validateHotelHasVouchersEnabledBlock({
      connection: networkConnection
    })(hotel.id);
  };
};

export const validateVoucherBelongsToHotel = (voucherConnection: MikroORM) => {
  return async (voucher: IVoucher, hotel: IHotel) => {
    return validateVoucherBelongsToHotelBlock({
      codeRepository: voucherConnection.em.getRepository(Code),
      hotelRepository: voucherConnection.em.getRepository(Hotel)
    })(voucher.id, hotel.id);
  };
};

export const constructCalculationInput = (
  input: OrderInput,
  calculationInput: IConstructCalculationInput,
  type: OrderCreationType
): IOrderCalculationInput => {
  const { items, customItems } = constructItemsForCalculation(calculationInput);

  const vouchers: IOrderCalculationVoucher[] = [];
  const discount: IOrderCalculationDiscount = {
    type: PriceMeasurementType.AMOUNT,
    value: 0.0,
    valueUsed: 0.0
  };

  switch (type) {
  case OrderCreationType.WITH_VOUCHER:
    vouchers.push({
      id: calculationInput.voucher.id,
      payer: calculationInput.voucher.program.payer,
      payerPercentage: calculationInput.voucher.program.payer_percentage,
      amountType: calculationInput.voucher.program.amount_type,
      type: calculationInput.voucher.program.type,
      value: calculationInput.voucher.program.amount,
      valueUsed: calculationInput.voucher.amount_used - calculationInput.totalVoucherPrice
    });
    break;
  case OrderCreationType.WITH_DISCOUNT:
    discount.type = calculationInput.discount.type;
    discount.value = calculationInput.discount.amount;
    discount.valueUsed = calculationInput.discount.amountUsed;
    break;
  case OrderCreationType.WITH_PRE_FIXE: {
    for (const voucher of calculationInput.preFixeVouchers) {
      vouchers.push({
        id: voucher.id,
        payer: voucher.program.payer,
        payerPercentage: voucher.program.payer_percentage,
        amountType: voucher.program.amount_type,
        type: voucher.program.type,
        value: voucher.program.amount,
        valueUsed: voucher.amount_used
      });
    }
    break;
  }
  default:
    break;
  }

  return {
    items,
    customItems,
    vouchers,
    ...(type === OrderCreationType.WITH_DISCOUNT && { discount }),
    tip: input.tip,
    paymentType: input.paymentType,
    taxRate: calculationInput.taxRate,
    isTaxExempt: calculationInput.isTaxExempt
  };
};

export const constructItemsForCalculation = (
  calculationInput: IConstructCalculationInput
) => {
  const items: IOrderItem[] = [];
  const customItems: IOrderCustomItem[] = [];

  for (const product of calculationInput.products) {
    const modifiers: IOrderModifier[] = [];

    for (const modifier of product.modifiers) {
      modifiers.push({
        id: modifier.modifierId,
        options: [{
          id: modifier.modifierOptionId,
          price: modifier.modifierOptionPrice,
          quantity: 1
        }]
      });
    }

    items.push({
      id: product.productId,
      price: product.price,
      quantity: product.quantity,
      modifiers: modifiers,
      ...(product.vouchers.length > 0 && {
        ruleId: product.vouchers[0].ruleId,
        codeId: product.vouchers[0].voucherCodeId
      })
    });
  }

  for (const customProduct of calculationInput.customProducts) {
    customItems.push({
      price: customProduct.price,
      quantity: customProduct.quantity
    });
  }

  return {
    items,
    customItems
  };
};

export const calculateAndApplyPricesToOrder = (
  order: Order,
  input: OrderInput,
  calculationInput: IConstructCalculationInput,
  type: OrderCreationType
) => {
  const calculations = calculate(constructCalculationInput(input, calculationInput, type));
  const {
    tip,
    taxAmount: tax,
    receiptAmount,
    totalNet,
    totalGross,
    grandTotal,
    hotelTotalNet,
    hotelTax,
    hotelGrandTotal,
    totalVoucherPrice
  } = calculations;

  validateOrderInputPrices(input, calculations);

  wrap(order).assign({
    tip,
    tax,
    hotelTax,
    totalNet,
    hotelTotalNet,
    totalGross,
    receiptAmount,
    grandTotal,
    hotelGrandTotal,
    totalVoucherPrice
  });

  return calculations;
};

export const validateOrderInputPrices = (input: OrderInput, calculations: IOrderCalculationOutput) => {
  if (input.receiptAmount !== calculations.receiptAmount) {
    logger.log(`Receipt amount is incorrect. It should equal to ${formatMoney(calculations.receiptAmount)}.`);
    throw new BadRequestError("Receipt amount is incorrect.");
  }

  if (input.tax !== calculations.taxAmount) {
    logger.log(`Tax amount is incorrect. It should equal to ${formatMoney(calculations.taxAmount)}`);
    throw new BadRequestError("Tax amount is incorrect.");
  }

  if (input.totalNet !== calculations.totalNet) {
    logger.log(`Total net amount is incorrect. It should equal to ${formatMoney(calculations.totalNet)}`);
    throw new BadRequestError("Total net amount is incorrect.");
  }

  if (input.totalGross !== calculations.totalGross) {
    logger.log(`Total gross amount is incorrect. It should equal to ${formatMoney(calculations.totalGross)}`);
    throw new BadRequestError("Total gross amount is incorrect.");
  }

  if (input.grandTotal !== calculations.grandTotal) {
    logger.log(`Grand total is incorrect. It should equal to ${formatMoney(calculations.grandTotal)}`);
    throw new BadRequestError("Grand total is incorrect.");
  }
};

export const validateDiscountCodePerClient = (orderRepository: OrderRepository) => {
  return async (order: Order, discount: Discount) => {
    const clientOrders = await orderRepository.getDeliveredOrdersByClientPhoneNumber(order.client.phoneNumber);

    let totalAmountSpent = 0;
    let totalCodeAmountSpent = 0;

    for (const clientOrder of clientOrders) {
      for (const orderDiscount of clientOrder.discounts) {
        if (orderDiscount.code === discount.code) {
          if (discount.usage === DiscountUsage.SINGLE_USE) {
            throw new BadRequestError("This discount code has already been used by this client.");
          }

          totalCodeAmountSpent += orderDiscount.amountUsed;
        }

        totalAmountSpent += clientOrder.grandTotal;
      }
    }

    if (totalAmountSpent < discount.unlockLimit) {
      throw new BadRequestError(
        `Client needs to spend $${discount.unlockLimit - totalAmountSpent} more if they want to use this discount code.`
      );
    }

    if (discount.usage === DiscountUsage.DOLLAR_ALLOTMENT && totalCodeAmountSpent > discount.amount) {
      throw new BadRequestError(
        `This client has exceeded the total amount that they can spend using this discount code.`
      );
    }
  };
};
