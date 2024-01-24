import { MikroORM } from "@mikro-orm/core";
import Code from "@services/service-voucher/src/code/entities/code";
import { OrderProduct, OrderCustomProduct } from "../entities/product";
import { OrderType, PaymentGateway } from "./enums";
import { PaymentType } from "@butlerhospitality/shared";
import Discount from "@services/service-discount/src/discount/entities/discount";
import Rule from "@services/service-voucher/src/rule/entities/rule";
import ModifierOption from "@services/service-menu/src/modifier/entities/modifier-option";
import { IOrder } from "../entities/order";

export interface IClient {
  name: string;
  email?: string;
  phoneNumber: string;
}

export interface IHotel {
  id: number;
  name: string;
  hubId: number;
  hubName: string;
  menuId: number;
  roomNumber: string;
}
export interface IVoucher {
  id: number;
  code: string;
}

export interface IDiscount {
  id: number;
  code: string;
}

export interface IProduct {
  id?: number;
  productId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  options: number[];
  comment?: string;
  code?: string;
  codeId?: number;
  ruleId?: number;
}

export interface ICustomProduct {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  comment?: string;
}
export interface IBaseScheduledOrderInput {
  scheduledDate?: string;
}

export interface IBaseVoucherOrderInput {
  voucher?: IVoucher;
}

export interface IBaseDiscountOrderInput {
  discount?: IDiscount;
}

export interface IBaseOrderInput extends IBaseScheduledOrderInput, IBaseVoucherOrderInput,
  IBaseDiscountOrderInput {
  comment?: string;
  client: IClient;
  hotel: IHotel;
  products: IProduct[];
  customProducts: ICustomProduct[];
  tax: number;
  totalNet: number;
  totalGross: number;
  grandTotal: number;
  receiptAmount: number;
  tip: number;
  transactionId?: string;
  cutlery: number;
  nonce?: string;
  type: OrderType;
  paymentType: PaymentType;
  paymentGateway?: PaymentGateway;
}

export interface IBaseOrderOutput extends IOrder { }

export interface IConstructCalculationInput {
  products: OrderProduct[];
  customProducts: OrderCustomProduct[];
  voucher?: Code;
  discount?: Discount;
  preFixeVouchers?: Code[];
  taxRate: number;
  isTaxExempt: boolean;
  refund?: number;
  totalVoucherPrice: number;
}

export interface VoucherMap {
  id: number;
  code: Code;
  rule: Rule;
}

export interface ModifierOptionMap {
  id: number;
  option: ModifierOption;
}
export interface IValidateUsecase {
  validate: boolean;
}

export interface IBaseOrderDependency extends IValidateUsecase {
  connection: MikroORM;
  tenant: string;
}

export interface OrderDBDependenciesConnection {
  menuConnection: MikroORM;
  networkConnection: MikroORM;
  voucherConnection: MikroORM;
	discountConnection: MikroORM;
}
