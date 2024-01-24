import { BaseEntity } from "@butlerhospitality/service-sdk";
import {
  OrderClient,
  Order,
  OrderMeta,
  OrderProduct,
  OrderCustomProduct,
  OrderProductModifier,
  OrderProductVoucher,
  OrderSnapshot,
  OrderStatusChange,
  OrderVoucher,
  OrderDiscount,
  OrderRefund,
  OrderTransactionLog
} from "../order/entity";
import { Payment, PaymentProvider } from "../payment/entity";
import { Service, ServiceType } from "../service/entity";
import { User } from "../user/entity";

export default [
  BaseEntity,
  User,
  Order,
  OrderClient,
  OrderMeta,
  OrderProduct,
  OrderCustomProduct,
  OrderProductModifier,
  OrderProductVoucher,
  OrderSnapshot,
  OrderStatusChange,
  OrderVoucher,
  OrderRefund,
  OrderDiscount,
  Payment,
  PaymentProvider,
  Service,
  ServiceType,
  OrderTransactionLog
];
