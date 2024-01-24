import { BaseEntity, IBaseEntity, IPublishableEntity, NumericType } from "@butlerhospitality/service-sdk";
import {
  ChangeSet,
  ChangeSetType,
  Collection,
  Entity,
  Enum,
  EventSubscriber,
  Filter,
  FlushEventArgs,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  UnitOfWork
} from "@mikro-orm/core";

import { OrderClient } from "./client";
import { OrderMeta } from "./meta";
import { OrderCustomProduct, OrderProduct } from "./product";
import { OrderSnapshot } from "./snapshot";
import { OrderStatusChange } from "./status-change";
import { Service } from "../../service/entity";
import { Payment } from "../../payment/entity";
import { OrderDiscount } from "./discount";
import { OrderSource, OrderStatus, OrderType } from "../shared/enums";
import { OrderVoucher } from "./voucher";
import { PaymentType } from "@butlerhospitality/shared";
import { OrderRepository } from "../repository";

export interface IOrder extends IBaseEntity {
  version: number;
  number: number;
  service: Service;
  parent?: Order;
  children: Collection<Order>;
  status: OrderStatus;
  meta: OrderMeta;
  client: OrderClient;
  vouchers: Collection<OrderVoucher>;
  discounts: Collection<OrderDiscount>;
  statuses: Collection<OrderStatusChange>;
  snapshots: Collection<OrderSnapshot>;
  products: Collection<OrderProduct>;
  payments: Collection<Payment>;
  type: OrderType;
  paymentType: PaymentType;
  scheduledDate?: Date;
  confirmedDate?: Date;
  kitchenConfirmedDate?: Date;
  transactionId?: string;
  tax: number;
  tip: number;
  totalNet: number;
  hotelTax: number
  hotelTotalNet: number
  totalGross: number;
  hotelTotalGross: number
  hotelGrandTotal: number
  grandTotal: number;
  receiptAmount: number;
  comment?: string;
  reason?: string;
  source: OrderSource;
  isRead: boolean;
}

export interface IOrderPublish extends IPublishableEntity {
}

@Entity({
  tableName: "orders",
  customRepository: () => OrderRepository
})
@Filter({
  name: "delivered",
  cond: {
    status: OrderStatus.DELIVERED
  }
})
export class Order extends BaseEntity implements IOrder {
  @Property({
    version: true
  })
  version!: number;

  @ManyToOne(() => Service)
  service!: Service;

  @ManyToOne({
    entity: () => Order,
    inversedBy: "children",
    nullable: true,
    hidden: true
  })
  parent?: Order;

  @OneToMany({
    entity: () => Order,
    mappedBy: "parent"
  })
  children = new Collection<Order>(this);

  @Enum(() => OrderStatus)
  status!: OrderStatus;

  @OneToOne({
    entity: () => OrderMeta,
    owner: true,
    eager: true
  })
  meta!: OrderMeta;

  @OneToOne({
    entity: () => OrderClient,
    owner: true,
    eager: true
  })
  client!: OrderClient;

  @OneToMany({
    entity: () => OrderVoucher,
    mappedBy: (voucher) => voucher.order,
    orphanRemoval: true
  })
  vouchers = new Collection<OrderVoucher>(this);

  @OneToMany({
    entity: () => OrderDiscount,
    mappedBy: (discount) => discount.order,
    orphanRemoval: true
  })
  discounts = new Collection<OrderDiscount>(this);

  @OneToMany(() => OrderStatusChange, (statusChange) => statusChange.order, {
    hidden: true
  })
  statuses = new Collection<OrderStatusChange>(this);

  @OneToMany(() => OrderSnapshot, (snapshot) => snapshot.order, {
    hidden: true
  })
  snapshots = new Collection<OrderSnapshot>(this);

  @OneToMany({ entity: () => OrderProduct, mappedBy: (product) => product.order, orphanRemoval: true })
  products = new Collection<OrderProduct>(this);

  @OneToMany({
    entity: () => OrderCustomProduct,
    mappedBy: (product) => product.order,
    orphanRemoval: true
  })
  customProducts = new Collection<OrderCustomProduct>(this);

  @OneToMany(() => Payment, (payment) => payment.order)
  payments = new Collection<Payment>(this);

  @Index()
  @Property()
  number!: number;

  @Enum(() => OrderType)
  type!: OrderType;

  @Enum(() => PaymentType)
  paymentType!: PaymentType;

  @Property({ persist: false })
  get date() {
    return this.scheduledDate || this.created_at;
  }

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  scheduledDate?: Date;

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  confirmedDate?: Date;

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  kitchenConfirmedDate?: Date;

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  deliveryDate?: Date;

  @Property({
    nullable: true,
    length: 50
  })
  transactionId?: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  tax!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  tip!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  totalNet!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  totalGross!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  grandTotal!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  receiptAmount!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  hotelTax: number = 0.0;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  hotelTotalNet: number = 0.0;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  hotelTotalGross: number = 0.0;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  hotelGrandTotal: number = 0.0;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  totalVoucherPrice: number = 0.0;

  @Property({
    length: 500,
    nullable: true
  })
  comment?: string;

  @Property({
    length: 500,
    nullable: true
  })
  reason?: string;

  @Property({
    type: "boolean",
    default: false
  })
  isRead: boolean = false;

  @Enum(() => OrderSource)
  source!: OrderSource;
}

export class OrderSubscriber implements EventSubscriber<Order> {
  private static insertStatusChange(uow: UnitOfWork, order: Order) {
    const orderStatusChange = new OrderStatusChange();

    orderStatusChange.status = order.status;
    orderStatusChange.userId = order.meta.foodCarrier?.id;

    order.statuses.add(orderStatusChange);
    uow.computeChangeSet(orderStatusChange);
  }

  private static insertSnapshot(uow: UnitOfWork, order: Order) {
    const orderSnapshot = new OrderSnapshot();
    const version = order.version ? order.version + 1 : 1;

    orderSnapshot.version = version;
    orderSnapshot.snapshot = order;

    order.snapshots.add(orderSnapshot);
    uow.computeChangeSet(orderSnapshot);
  }

  async onFlush(args: FlushEventArgs) {
    const changeSets = args.uow.getChangeSets();
    const orderRepository = args.em.getRepository(Order) as OrderRepository;
    const orders = changeSets.filter((cs) => cs.entity instanceof Order) as ChangeSet<Order>[];

    for (const order of orders) {
      await orderRepository.applyRelationsToOrder(order.entity);

      const isCreate = order.type === ChangeSetType.CREATE;
      const hasStatusUpdate =
        order.type === ChangeSetType.UPDATE &&
        order.originalEntity?.status !== order.entity.status &&
        order.entity.status !== OrderStatus.IN_DELIVERY;

      const needsStatusChange = isCreate || hasStatusUpdate;

      if (needsStatusChange) {
        OrderSubscriber.insertStatusChange(args.uow, order.entity);
      }

      OrderSubscriber.insertSnapshot(args.uow, order.entity);

      args.uow.recomputeSingleChangeSet(order.entity);
    }
  }
}
