import { BaseEntity, CustomEntityRepository, NumericType } from "@butlerhospitality/service-sdk";
import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";
import { Service } from "../../service/entity";
import { Order } from "./order";
import { PriceMeasurementType } from "@butlerhospitality/shared";

@Entity({
  customRepository: () => CustomEntityRepository
})
export class OrderRefund extends BaseEntity {
  @ManyToOne({ entity: () => Order })
  order!: Order;

  @ManyToOne({ entity: () => Service })
  service!: Service;

  @Enum(() => PriceMeasurementType)
  type!: PriceMeasurementType;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  amount!: number;

  @Property({ length: 500 })
  reason!: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  grandTotal!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  totalVoucherPrice!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType, default: 0.0 })
  hotelGrandTotal: number = 0.0;
}
