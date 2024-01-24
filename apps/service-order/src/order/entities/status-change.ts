import { BaseEntity } from "@butlerhospitality/service-sdk";
import {
  Enum,
  Entity,
  Property,
  ManyToOne
} from "@mikro-orm/core";
import { OrderStatusChangeRepository } from "../repositories/status-change";
import { OrderStatus } from "../shared/enums";
import { Order } from "./order";

@Entity({
  customRepository: () => OrderStatusChangeRepository
})
export class OrderStatusChange extends BaseEntity {
  @ManyToOne({ entity: () => Order })
  order!: Order;

  @Property({ nullable: true })
  userId?: number;

  @Enum(() => OrderStatus)
  status!: OrderStatus;

  @Property({
    defaultRaw: "now()"
  })
  statusDate: Date = new Date();
}
