import {
  Collection,
  Entity, ManyToOne, OneToMany, Property
} from "@mikro-orm/core";
import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { Order } from "./order";
import { OrderProductVoucher } from "./product-voucher";
import { OrderProductModifier } from "./modifier";
import { OrderProductRepository, OrderCustomProductRepository } from "../repositories/product";

@Entity({
  customRepository: () => OrderProductRepository
})
export class OrderProduct extends BaseEntity {
  @ManyToOne({ entity: () => Order, hidden: true })
  order!: Order;

  @Property()
  categoryId!: number;

  @Property({ length: 255 })
  categoryName: string;

  @Property()
  productId!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  originalPrice!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  price!: number;

  @Property({ columnType: "smallint" })
  quantity!: number;

  @Property({ length: 500, nullable: true })
  comment?: string;

  @Property({
    type: "boolean",
    default: false
  })
  isPrepared: boolean = false;

  @OneToMany({
    entity: () => OrderProductVoucher,
    mappedBy: (productVoucher) => productVoucher.orderProduct,
    orphanRemoval: true
  })
  vouchers = new Collection<OrderProductVoucher>(this);

  @OneToMany({
    entity: () => OrderProductModifier,
    mappedBy: (productModifier) => productModifier.orderProduct,
    orphanRemoval: true
  })
  modifiers = new Collection<OrderProductModifier>(this);
}

@Entity({
  tableName: "order_product_custom",
  customRepository: () => OrderCustomProductRepository
})
export class OrderCustomProduct extends BaseEntity {
  @ManyToOne({ entity: () => Order, hidden: true })
  order!: Order;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  price!: number;

  @Property({ columnType: "smallint" })
  quantity!: number;

  @Property({ length: 500, nullable: true })
  comment?: string;

  @Property({
    type: "boolean",
    default: false
  })
  isPrepared: boolean = false;
}
