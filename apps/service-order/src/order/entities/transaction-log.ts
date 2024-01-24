import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import {
  Entity, Enum, Index, ManyToOne, Property
} from "@mikro-orm/core";
import { Service } from "../../service/entity";
import { OrderTransactionLogRepository } from "../repository";
import { Order } from "./order";

export enum Currency {
  USD = "USD",
  EUR = "EUR",
}

export enum TransactionType {
  CREDIT_CARD = "CREDIT_CARD",
  CHARGE_TO_ROOM = "CHARGE_TO_ROOM",
  VOUCHER = "VOUCHER",
  REFUND = "REFUND",
}

@Entity({
  customRepository: () => OrderTransactionLogRepository
})
export class OrderTransactionLog extends BaseEntity {
  @ManyToOne({ entity: () => Order })
  order!: Order;

  @ManyToOne({ entity: () => Service })
  service!: Service;

  @Index()
  @Enum(() => TransactionType)
  type!: TransactionType;

  @Enum({
    items: () => Currency,
    default: Currency.USD
  })
  currency: Currency = Currency.USD;

  @Property({ length: 255, nullable: true })
  transactionId?: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  amount!: number;
}
