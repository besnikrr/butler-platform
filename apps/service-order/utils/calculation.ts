import { logger } from "@butlerhospitality/service-sdk";
import { Decimal } from "decimal.js-light";
import { AmountType, PaymentType, PriceMeasurementType, VoucherPayer, VoucherType } from "@butlerhospitality/shared";

Decimal.config({ rounding: Decimal.ROUND_HALF_UP });

export interface IOrderModifierOption {
  id: number;
  price: number;
  quantity: number;
}

export interface IOrderModifier {
  id: number;
  options: IOrderModifierOption[];
}

export interface IOrderItem {
  id: number;
  price: number;
  modifiers?: IOrderModifier[];
  quantity: number;
  codeId?: number;
  ruleId?: number;
}

export interface IOrderCustomItem {
  price: number;
  quantity: number;
}

export interface IOrderCalculationDiscount {
  value: number;
  valueUsed: number;
  type: PriceMeasurementType;
}

export interface IOrderCalculationVoucher {
  id: number;
  type: VoucherType;
  value: number;
  valueUsed?: number;
  amountType: AmountType;
  payer: VoucherPayer;
  payerPercentage: number;
}

export interface IOrderCalculationInput {
  items: IOrderItem[];
  customItems?: IOrderCustomItem[];
  tip: number;
  discount?: IOrderCalculationDiscount;
  vouchers?: IOrderCalculationVoucher[];
  taxRate?: number;
  isTaxExempt?: boolean;
  paymentType: PaymentType;
}

export interface IOrderCalculationOutput {
  receiptAmount: number;
  taxAmount: number;
  totalNet: number;
  totalGross: number;
  grandTotal: number;
  hotelTotalNet: number;
  hotelTax: number;
  hotelGrandTotal: number;
  totalVoucherPrice: number;
  tip: number;
  discount: number;
}

export interface IRefundOrderCalculationOutput {
  newGrandTotal: number;
  refundedGrandTotal: number;
  newTotalVoucherPrice: number;
  refundedTotalVoucherPrice: number;
  grandTotal: number;
  totalVoucherPrice: number;
  newHotelGrandTotal: number;
  newHotelTotalNet: number;
  newHotelTax: number;
}

export interface IDefaultOrderValue {
  grandTotal: number;
  refund: IRefund;
  totalVoucherPrice: number;
  vouchers: IOrderCalculationVoucher[];
  hotelGrandTotal: number;
  taxRate: number;
}

export interface IOrderCalculation {
  calculate(input: IOrderCalculationInput): IOrderCalculationOutput
}

export const calculate = (
  input: IOrderCalculationInput): IOrderCalculationOutput => {
  const {
    items,
    customItems,
    tip,
    discount,
    taxRate,
    isTaxExempt,
    paymentType
  } = input;
  let { vouchers } = input;
  if (!vouchers) {
    vouchers = [];
  }

  validateVoucherPayload(items, vouchers);
  validatePrefixePayload(items, vouchers);
  const receiptAmount: Decimal = calculateReceiptAmount(items, customItems);
  const discountValue: Decimal = getDiscountValue(receiptAmount, discount);
  const totalNet: Decimal = calculateTotalNet({
    receiptAmount: receiptAmount,
    discount: discount,
    vouchers: vouchers
  });
  const taxAmount: Decimal = calculateTaxAmount({
    amount: totalNet,
    taxRate: taxRate,
    isTaxExempt: isTaxExempt
  });
  const totalGross: Decimal = calculateTotalGross({
    taxAmount: taxAmount,
    totalNet: totalNet
  });
  const grandTotal: Decimal = calculateGrandTotal({
    tip: tip,
    totalGross: totalGross,
    vouchers: vouchers
  });
  const hotelTotalNet: Decimal = calculateHotelTotalNet({
    receiptAmount: receiptAmount,
    grandTotal: grandTotal,
    isTaxExempt: isTaxExempt,
    tip: tip,
    totalNet: totalNet,
    taxRate: taxRate,
    vouchers: vouchers,
    paymentType: paymentType,
    discount: discount
  });
  const totalVoucherPrice: Decimal = getTotalVoucherPrice(
    (vouchers.length && vouchers[0].type === VoucherType.PER_DIEM) ? totalGross : receiptAmount, vouchers
  );
  const hotelTax: Decimal = calculateHotelTax({
    hotelTotalNet: hotelTotalNet,
    isTaxExempt: isTaxExempt,
    taxRate: taxRate
  });
  const hotelGrandTotal = calculateHotelGrandTotal(hotelTotalNet, hotelTax, getTipValue(tip), paymentType);
  const totalTip = getTipValue(tip);

  // revenue

  return {
    receiptAmount: +receiptAmount.toFixed(2),
    taxAmount: +taxAmount.toFixed(2),
    totalNet: +totalNet.toFixed(2),
    totalGross: +totalGross.toFixed(2),
    tip: +totalTip.toFixed(2),
    grandTotal: +grandTotal.toFixed(2),
    hotelTotalNet: +hotelTotalNet.toFixed(2),
    hotelTax: +hotelTax.toFixed(2),
    hotelGrandTotal: +hotelGrandTotal.toFixed(2),
    totalVoucherPrice: +totalVoucherPrice.toFixed(2),
    discount: +discountValue.toFixed(2)
  };
};

export const calculateRefund = (input?: IDefaultOrderValue): IRefundOrderCalculationOutput => {
  const {
    grandTotal,
    refund,
    totalVoucherPrice,
    vouchers,
    hotelGrandTotal,
    taxRate
  } = input;

  let refundedTotalVoucherPrice = new Decimal(0);
  let newGrandTotal = new Decimal(0);
  let percentageValue = new Decimal(100);
  const decimalGrandTotal = new Decimal(grandTotal);
  const decimalHotelGrandTotal = new Decimal(hotelGrandTotal);
  const decimalTotalVoucherPrice = new Decimal(totalVoucherPrice);

  const refundValue =
  refund.type === PriceMeasurementType.PERCENTAGE ?
    new Decimal(refund.value).div(new Decimal(100)).mul(decimalGrandTotal.add(decimalTotalVoucherPrice)) :
    new Decimal(refund.value);

  if (refundValue.comparedTo(decimalGrandTotal.add(decimalTotalVoucherPrice)) > 0) {
    throw new Error("Refund amount greater than grandTotal + totalVoucherPrice");
  }

  if (decimalGrandTotal.comparedTo(refundValue) >= 0) {
    newGrandTotal = decimalGrandTotal.minus(refundValue);
  } else {
    if (vouchers && vouchers.length && vouchers[0].type === VoucherType.PER_DIEM) {
      percentageValue = vouchers[0].payerPercentage ?
        new Decimal(vouchers[0].payerPercentage) : new Decimal(100);

      refundedTotalVoucherPrice = refundValue.minus(decimalGrandTotal);

      // this condition covers the case when the refund is greater than (grandtotal + voucherprice)
      // we should not allow that as we should be precise about refunds and we throw an exception as above
      /**
			if (refundedTotalVoucherPrice.comparedTo(decimalTotalVoucherPrice) > 0) {
				refundedTotalVoucherPrice = decimalTotalVoucherPrice;
			}
			*/
    }
  }

  const newTotalVoucherPrice = decimalTotalVoucherPrice.minus(refundedTotalVoucherPrice);
  const newHotelGrandTotal = decimalHotelGrandTotal.comparedTo(new Decimal(0)) ?
    decimalHotelGrandTotal.minus(refundedTotalVoucherPrice.mul(percentageValue).div(new Decimal(100))) :
    decimalHotelGrandTotal;
  const newHotelTotalNet = getValueWithoutTax(taxRate, newHotelGrandTotal);
  const newHotelTax = newHotelGrandTotal.minus(newHotelTotalNet);
  return {
    newGrandTotal: +newGrandTotal.toFixed(2),
    refundedGrandTotal: +decimalGrandTotal.minus(newGrandTotal).toFixed(2),
    newTotalVoucherPrice: +newTotalVoucherPrice.toFixed(2),
    refundedTotalVoucherPrice: +refundedTotalVoucherPrice.toFixed(2),
    newHotelGrandTotal: +newHotelGrandTotal.toFixed(2),
    newHotelTotalNet: +newHotelTotalNet.toFixed(2),
    newHotelTax: +newHotelTax.toFixed(2),
    grandTotal: +decimalGrandTotal.toFixed(2),
    totalVoucherPrice: +decimalTotalVoucherPrice.toFixed(2)
  };
};

export const validateItemData = (item: IOrderItem) => {
  const { id, price, quantity } = item;
  const decimalPrice = new Decimal(price);
  if (!id || !decimalPrice || !quantity) {
    logger.log("[validate-item-data]: ", item);
    throw new Error("Invalid order item");
  }
};

export const validateCustomItemData = (item: IOrderCustomItem) => {
  const { price, quantity } = item;
  const decimalPrice = new Decimal(price);

  if (decimalPrice && quantity) {
    return;
  }
  logger.log("[validate-custom-item-data]: ", JSON.stringify(item));
  throw new Error("Invalid custom order item");
};

export const validateVoucherPayload = (items: IOrderItem[], vouchers: IOrderCalculationVoucher[]) => {
  if (!vouchers || Object.keys(vouchers).length === 0) {
    return;
  }
  let cnt = 0;
  items.forEach((item: IOrderItem) => {
    if (item.codeId || item.ruleId) {
      cnt++;
    }
  });
  const prefixeVouchers = vouchers.filter((v: IOrderCalculationVoucher) => {
    if (v.type == null) {
      throw new Error("Voucher type cannot be null");
    }
    return v.type === VoucherType.PRE_FIXE;
  });
  if (prefixeVouchers.length > cnt) {
    throw new Error("Cannot have less items than prefixe vouchers applied");
  }
};

export const getTotalVoucherPrice = (
  amount: Decimal, vouchers: IOrderCalculationVoucher[]
) => {
  let totalVoucherPrice = new Decimal(0);
  if (vouchers.length > 0) {
    if (vouchers.length == 1) {
      if (vouchers[0].type === VoucherType.DISCOUNT) {
        totalVoucherPrice = getVoucherValue(amount, vouchers[0]);
      }
      if (vouchers[0].type === VoucherType.PER_DIEM) {
        if (vouchers[0].amountType !== AmountType.FIXED) {
          throw new Error("Perdiem supports only FIXED type");
        }
        totalVoucherPrice = getVoucherValue(amount, vouchers[0]);
        if (totalVoucherPrice.comparedTo(amount) >= 0) {
          totalVoucherPrice = amount;
        }
      }
      if (vouchers[0].type === VoucherType.PRE_FIXE) {
        if (vouchers[0].amountType !== AmountType.FIXED) {
          throw new Error("Prefixe supports only FIXED type");
        }
        totalVoucherPrice = totalVoucherPrice.add(vouchers[0].value);
      }
    } else {
      vouchers.forEach((voucher: IOrderCalculationVoucher) => {
        if (voucher.type !== VoucherType.PRE_FIXE) {
          throw new Error("Multiple vouchers are allowed for PREFIXE only");
        }
        if (voucher.amountType !== AmountType.FIXED) {
          throw new Error("Prefixe supports only FIXED type");
        }
        totalVoucherPrice = totalVoucherPrice.add(voucher.value);
      });
    }
  }
  return totalVoucherPrice;
};

export const getPerdiemVoucherValue = (voucher: IOrderCalculationVoucher) => {
  if (voucher.amountType !== AmountType.FIXED) {
    throw new Error("Perdiem supports only FIXED type");
  }
  try {
    const voucherValue = new Decimal(voucher.value);
    const voucherValueUsed = new Decimal(voucher.valueUsed);
    return voucherValue.sub(voucherValueUsed);
  } catch (e) {
    logger.log("[get-perdiem-voucher-value]", e);
    throw new Error("Attributes missing for perdiem voucher value");
  }
};

export const calculateBasicTotalPrice = (input: IOrderItem) => {
  if ((input.codeId && input.ruleId == null) || (input.ruleId && input.codeId == null)) {
    throw new Error(`Inconsistency between rule id and code id ${input}`);
  }

  if (input.codeId && input.ruleId) {
    return new Decimal(0);
  }

  return new Decimal(input.price).mul(input.quantity);
};

export const validatePrefixePayload = (items: IOrderItem[], vouchers: IOrderCalculationVoucher[]) => {
  if (vouchers.length == 1 && vouchers[0].type !== VoucherType.PRE_FIXE) {
    return;
  }
  const itemsWithCodes = {};
  items.forEach((item: IOrderItem) => {
    if (item.codeId) {
      itemsWithCodes[item.codeId] = true;
      // item.price = new Decimal(0);
    }
  });

  if (Object.keys(itemsWithCodes).length == 0 && vouchers.length > 0) {
    throw new Error("Prefixe inconsistency between input vouchers and item vouchers");
  }
  if (Object.keys(itemsWithCodes).length > 0 && Object.keys(itemsWithCodes).length !== vouchers.length) {
    throw new Error("Prefixe inconsistency between input vouchers and item vouchers");
  }
};

export const calculateCustomItemsValue = (items: IOrderCustomItem[]): Decimal => {
  let totalItemsPrice: Decimal = new Decimal(0.0);
  items.forEach((item: IOrderItem) => {
    validateCustomItemData(item);
    const totalItemPrice: Decimal = calculateBasicTotalPrice(item);
    totalItemsPrice = totalItemsPrice.add(totalItemPrice);
  });
  return totalItemsPrice;
};

export const calculateModifiersValue = (modifiers: IOrderModifier[], itemQuantity: number): Decimal => {
  let totalOptionsPrice: Decimal = new Decimal(0.0);
  modifiers.forEach((modifier: IOrderModifier) => {
    modifier.options.forEach((option: IOrderModifierOption) => {
      const totalOptionPrice = calculateBasicTotalPrice(option);
      totalOptionsPrice = totalOptionsPrice.add(totalOptionPrice);
    });
  });
  return totalOptionsPrice.mul(itemQuantity);
};

export const calculateOrderItemsValue = (items: IOrderItem[]): Decimal => {
  let totalItemsPrice: Decimal = new Decimal(0.0);
  items.forEach((item: IOrderItem) => {
    validateItemData(item);
    const totalItemPrice: Decimal = calculateBasicTotalPrice(item);
    const totalModifiersPrice = calculateModifiersValue(item.modifiers, item.quantity);
    totalItemsPrice = totalItemsPrice.add(totalItemPrice.add(totalModifiersPrice));
  });
  return totalItemsPrice;
};

export const calculateItemsValue = (items: IOrderItem[], customItems: IOrderCustomItem[]): Decimal => {
  const totalItemsPrice: Decimal = calculateOrderItemsValue(items);
  const totalCustomItemsPrice: Decimal = customItems && customItems.length ?
    calculateCustomItemsValue(customItems) : new Decimal(0.0);

  return totalItemsPrice.add(totalCustomItemsPrice);
};

export const calculateReceiptAmount = (items: IOrderItem[], customItems: IOrderCustomItem[]): Decimal => {
  return calculateItemsValue(items, customItems);
};

export const getDiscountValue = (amount: Decimal, discount: IOrderCalculationDiscount): Decimal => {
  if (!discount) {
    return new Decimal(0);
  }
  const discountValue = new Decimal(discount.value);
  const discountValueUsed = new Decimal(discount.valueUsed);

  const value = discount.type === PriceMeasurementType.PERCENTAGE ?
    discountValue.div(new Decimal(100)).mul(amount).minus(discountValueUsed) : discountValue.minus(discountValueUsed);

  if (value.comparedTo(new Decimal(0)) < 0) {
    throw new Error("Discount value used greater than value");
  }

  return value.comparedTo(amount) >= 0 ? amount : value;
};

export const getVoucherValue = (amount: Decimal, voucher: IOrderCalculationVoucher): Decimal => {
  const voucherValue = voucher.amountType === AmountType.PERCENTAGE ?
    amount.mul(new Decimal(voucher.value))
      .div(new Decimal(100)) :
    voucher.type === VoucherType.PER_DIEM ? getPerdiemVoucherValue(voucher) :
      new Decimal(voucher.value);

  if (voucher.type === VoucherType.DISCOUNT && voucherValue.comparedTo(amount) > 0) {
    return amount;
  }
  return voucherValue;
};

export interface ITaxAmountInput {
  amount: Decimal;
  taxRate: number;
  isTaxExempt: boolean;
}

export const calculateTaxAmount = (input: ITaxAmountInput) => {
  const { amount, taxRate, isTaxExempt } = input;
  return isTaxExempt ? new Decimal(0) : amount.mul(taxRate).div(new Decimal(100));
};

export interface ITotalNetInput {
  receiptAmount: Decimal;
  discount?: IOrderCalculationDiscount;
  vouchers?: IOrderCalculationVoucher[];
  refund?: IRefund;
}

export const calculateTotalNet = (input: ITotalNetInput): Decimal => {
  const { receiptAmount, discount, vouchers } = input;
  let voucher: IOrderCalculationVoucher = null;
  if (vouchers && vouchers.length) {
    voucher = vouchers[0];
  }
  if (voucher && discount) {
    throw new Error("Cannot apply both voucher and discount to an order");
  }
  let discountValue: Decimal = discount ? getDiscountValue(receiptAmount, discount) : new Decimal(0);

  if (voucher?.type === VoucherType.DISCOUNT) {
    discountValue = getVoucherValue(receiptAmount, voucher);
  }
  const zeroAmount: Decimal = new Decimal(0);
  const totalNet = receiptAmount.sub(discountValue);

  return totalNet.comparedTo(zeroAmount) > 0 ? totalNet : zeroAmount;
};

export interface ITotalGrossInput {
  totalNet: Decimal;
  taxAmount: Decimal;
}

export const calculateTotalGross = (input: ITotalGrossInput): Decimal => {
  const { totalNet, taxAmount } = input;
  return totalNet.add(taxAmount);
};

export interface IGrandTotalInput {
  totalGross: Decimal;
  vouchers: IOrderCalculationVoucher[];
  tip: number;
}

export const calculateGrandTotal = (input: IGrandTotalInput): Decimal => {
  const { totalGross, vouchers, tip } = input;
  const voucher = vouchers && vouchers.length ? vouchers[0] : null;

  const grandTotal = totalGross.add(getTipValue(tip)).sub(
    (voucher && voucher.type === VoucherType.PER_DIEM) ? getPerdiemVoucherValue(voucher) : new Decimal(0)
  );
  return grandTotal.comparedTo(new Decimal(0)) <= 0 ? new Decimal(0) : grandTotal;
};

export const getTipValue = (tip: number) => {
  return tip ? new Decimal(tip) : new Decimal(0);
};

export const getValueWithoutTax = (taxRate: number, value: Decimal) => {
  // TP / 1 + R
  const divisor: Decimal = new Decimal(1).add(new Decimal(taxRate).mul(new Decimal("0.01")));
  return value.div(divisor);
};

export const getValueWithTax = (taxRate: number, value: Decimal) => {
  return value.add(value.mul(new Decimal(taxRate).mul(new Decimal("0.01"))));
};

export interface IHotelTotalNetInput {
  totalNet: Decimal;
  grandTotal: Decimal
  tip: number;
  receiptAmount: Decimal;
  discount: IOrderCalculationDiscount;
  // refund: IRefund;
  vouchers: IOrderCalculationVoucher[];
  paymentType: PaymentType;
  isTaxExempt: boolean;
  taxRate: number;
}

export const getVoucherAmountOwedByHotel = (
  input: IHotelTotalNetInput
): Decimal => {
  const {
    receiptAmount,
    totalNet,
    vouchers,
    paymentType,
    grandTotal,
    tip,
    taxRate
  } = input;

  if (vouchers && vouchers.length) {
    checkOverage(paymentType, grandTotal, getTipValue(tip));
    if (vouchers.length === 1) {
      const voucher = vouchers[0];
      if (voucher.payer === VoucherPayer.BUTLER) {
        return new Decimal(0);
      }
      const percentageValue: Decimal = voucher.payerPercentage ?
        new Decimal(voucher.payerPercentage) : new Decimal(100);
      if (voucher.type === VoucherType.DISCOUNT || voucher.type === VoucherType.PER_DIEM) {
        // if (isTaxExempt) {
        // 	return new Decimal(0);
        // } // this is how it is in oms but it shouldn't and should be discussed
        const voucherAmountOwedByHotelWithTax = getVoucherValue(receiptAmount, voucher)
          .mul(percentageValue)
          .div(new Decimal(100));

        const valwitax = getValueWithoutTax(taxRate, voucherAmountOwedByHotelWithTax);
        return valwitax;
      }
    }

    if (vouchers.length >= 1) {
      let totalValue = new Decimal(0);
      const vouchersChecked = {};
      vouchers.forEach((voucher: IOrderCalculationVoucher) => {
        if (voucher.type !== VoucherType.PRE_FIXE) {
          throw new Error(`Cannot have multiples on voucher with type ${voucher.type}`);
        }
        if (!vouchersChecked[voucher.id]) {
          let prefixePercentageValue = new Decimal(0);
          if (voucher.payer === VoucherPayer.HOTEL) {
            prefixePercentageValue = voucher.payerPercentage ?
              new Decimal(voucher.payerPercentage) : new Decimal(100);
          }
          const voucherAmountOwedByHotelWithTax = getVoucherValue(totalNet, voucher)
            .mul(prefixePercentageValue)
            .div(new Decimal(100));
          const prefixeValue = getValueWithoutTax(taxRate, voucherAmountOwedByHotelWithTax);
          totalValue = totalValue.add(prefixeValue);
          vouchersChecked[voucher.id] = true;
        }
      });
      return totalValue;
    }
  }

  return new Decimal(0);
};

export const checkOverage = (paymentType: PaymentType, grandTotal: Decimal, tip: Decimal) => {
  if (grandTotal.comparedTo(new Decimal(0)) <= 0 && paymentType == PaymentType.CREDIT_CARD) {
    throw new Error("Payment type should be charge to room");
  }
  if (grandTotal.add(tip).comparedTo(new Decimal(0)) > 0 && paymentType !== PaymentType.CREDIT_CARD) {
    throw new Error("Credit card required for orders with overage");
  }
};

export const calculateHotelTotalNet = (input: IHotelTotalNetInput) => {
  const {
    discount,
    receiptAmount,
    paymentType,
    vouchers
  } = input;

  const voucherAmountOwedByHotel = getVoucherAmountOwedByHotel(input);

  if (paymentType === PaymentType.CREDIT_CARD) {
    return voucherAmountOwedByHotel;
  }
  if (paymentType === PaymentType.CHARGE_TO_ROOM) {
    const discountValue = getDiscountValue(receiptAmount, discount);

    const hotelTotalNet = vouchers && vouchers.length &&
      voucherAmountOwedByHotel &&
      voucherAmountOwedByHotel.comparedTo(new Decimal(0)) >= 0 ?
      voucherAmountOwedByHotel : receiptAmount;
    return hotelTotalNet.comparedTo(new Decimal(0)) > 0 ?
      hotelTotalNet.sub(discountValue) : new Decimal(0);
  }

  throw new Error("Unsupported Payment type");
};

export interface IHotelTaxInput {
  hotelTotalNet: Decimal;
  isTaxExempt: boolean;
  taxRate: number;
}

export const calculateHotelTax = (input: IHotelTaxInput): Decimal => {
  const { hotelTotalNet, isTaxExempt, taxRate } = input;

  return isTaxExempt ? new Decimal(0) : calculateTaxAmount({
    taxRate: taxRate,
    amount: hotelTotalNet,
    isTaxExempt: isTaxExempt
  });
};

export const calculateHotelGrandTotal = (
  hotelTotalNet: Decimal, hotelTax: Decimal, tip: Decimal, paymentType: PaymentType
): Decimal => {
  if (paymentType === PaymentType.CREDIT_CARD) {
    tip = new Decimal(0);
  }
  return hotelTotalNet.add(tip).add(hotelTax);
};

export interface IRefund {
  createdAt?: Date; // todo: remove optional
  type: PriceMeasurementType;
  value: number;
}

export const calculateRevenue = (receiptAmount: Decimal, refund: Decimal): Decimal => {
  return receiptAmount.sub(refund);
};
