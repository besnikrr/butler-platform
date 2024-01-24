import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { PaymentType } from "@butlerhospitality/shared";
import {
  ChangeSet,
  ChangeSetType,
  Collection,
  Entity,
  Enum,
  EventSubscriber,
  FlushEventArgs,
  ManyToMany,
  ManyToOne,
  Property,
  UnitOfWork
} from "@mikro-orm/core";
import {
  Currency, Order, OrderTransactionLog, TransactionType
} from "../order/entity";
import { OrderPaymentRepository } from "../order/repository";
import { Service } from "../service/entity";

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
}

@Entity({
  customRepository: () => OrderPaymentRepository
})
export class Payment extends BaseEntity {
  @ManyToOne({ entity: () => Order })
  order!: Order;

  @ManyToOne({ entity: () => Service })
  service!: Service;

  @Enum(() => PaymentType)
  paymentType!: PaymentType;

  @Enum(() => PaymentStatus)
  status!: PaymentStatus;

  @Property({ length: 255, nullable: true })
  transactionId?: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  tip!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  tax!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  totalNet!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  totalGross!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  grandTotal!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  hotelTax!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  hotelTotalNet!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  hotelTotalGross!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  hotelGrandTotal!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  receiptAmount!: number;
}

export class PaymentSubscriber implements EventSubscriber<Payment> {
  async onFlush(args: FlushEventArgs) {
    const changeSets = args.uow.getChangeSets();
    const payments = changeSets.filter((cs) => cs.entity instanceof Payment) as ChangeSet<Payment>[];

    payments.map((payment) => {
      const needsTransactionChange =
        payment.type === ChangeSetType.CREATE ||
        (payment.type === ChangeSetType.UPDATE &&
          payment.originalEntity?.transactionId !== payment.entity.transactionId
        );

      if (needsTransactionChange) {
        this.insertTransactionLog(args.uow, payment.entity);
      }
      args.uow.recomputeSingleChangeSet(payment.entity);
    });
  }

  async insertTransactionLog(uow: UnitOfWork, payment: Payment) {
    const orderTransactionLog = new OrderTransactionLog();
    orderTransactionLog.order = payment.order;
    // we are going to have the amount of value as parameter, right now is hardcoded
    orderTransactionLog.amount = 20;
    orderTransactionLog.transactionId = payment.transactionId;
    orderTransactionLog.service = payment.service;
    orderTransactionLog.type = TransactionType[payment.paymentType];
    orderTransactionLog.currency = Currency.USD;
    uow.computeChangeSet(orderTransactionLog);
  }
}

@Entity()
export class PaymentProvider extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @ManyToMany(() => Service, (service) => service.paymentProviders)
  services = new Collection<Service>(this);
}
