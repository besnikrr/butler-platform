import { BaseEntity, CustomEntityRepository, NumericType } from "@butlerhospitality/service-sdk";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { OrderProduct } from "./product";

@Entity({
  customRepository: () => CustomEntityRepository
})
export class OrderProductModifier extends BaseEntity {
  @ManyToOne({ entity: () => OrderProduct })
  orderProduct!: OrderProduct;

  @Property()
  modifierId!: number;

  @Property({ length: 255 })
  modifierName!: string;

  @Property()
  modifierOptionId!: number;

  @Property({ length: 255 })
  modifierOptionName!: string;

  @Property({ columnType: "numeric(19,2)", type: NumericType })
  modifierOptionPrice!: number;

  @Property({ columnType: "smallint" })
  quantity!: number;

  @Property({ length: 500, nullable: true })
  comment?: string;
}
