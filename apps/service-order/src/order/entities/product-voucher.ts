import { BaseEntity, CustomEntityRepository, NumericType } from "@butlerhospitality/service-sdk";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { OrderProduct } from "./product";

@Entity({
  customRepository: () => CustomEntityRepository
})
export class OrderProductVoucher extends BaseEntity {
  @ManyToOne({
    entity: () => OrderProduct
  })
  orderProduct!: OrderProduct;

  @Property({ length: 10 })
  voucherCode!: string;

  @Property()
  voucherCodeId!: number;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  ruleMaxItemPrice!: number;

  @Property()
  ruleId!: number;
}
