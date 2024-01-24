
import { NumericType, BaseEntity } from "@butlerhospitality/service-sdk";
import { BigIntType, Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { ModifierOptionRepository } from "../repository";
import Modifier from "./modifier";

@Entity({ customRepository: () => ModifierOptionRepository })
export default class ModifierOption extends BaseEntity {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Property({
    type: NumericType,
    columnType: "numeric (19,2)"
  })
  price!: number;

  @ManyToOne({
    entity: () => Modifier
  })
  modifier: Modifier;
}
