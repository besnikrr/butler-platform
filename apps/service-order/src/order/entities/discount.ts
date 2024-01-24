import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Service } from "../../service/entity";
import { Order } from "./order";
import { PriceMeasurementType } from "@butlerhospitality/shared";
import { OrderDiscountRepository } from "../repositories/discount";

@Entity({
  customRepository: () => OrderDiscountRepository
})
export class OrderDiscount extends BaseEntity {
  @Property()
  discountCodeId!: number;

  @ManyToOne({ entity: () => Order })
  order!: Order;

  @ManyToOne({ entity: () => Service })
  service!: Service;

  @Property({ length: 100 })
  code!: string;

  @Enum(() => PriceMeasurementType)
  type!: PriceMeasurementType;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  amount!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  amountUsed!: number;
}
