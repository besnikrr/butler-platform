
import { BaseEntity, IBaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { DiscountUsage, PriceMeasurementType } from "@butlerhospitality/shared";
import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  OneToMany,
  Property,
  Unique
} from "@mikro-orm/core";
import { DiscountRepository } from "../repository";
import { Hub } from "../../hub/entity";
import DiscountClient from "./discount-client";

export interface IDiscount extends IBaseEntity {
  name: string;
  code: string;
  amount: number;
  type: PriceMeasurementType;
  usage: DiscountUsage;
  unlockLimit: number;
  startDate: Date;
  endDate?: Date;
  hubs: Collection<Hub>;
  discountClients: Collection<DiscountClient>;
}

@Entity({
  customRepository: () => DiscountRepository
})
export default class Discount extends BaseEntity implements IDiscount {
  @Property({
    unique: true,
    columnType: "bigint",
    nullable: true
  })
  omsId?: number;

  @Property({ length: 255 })
  name!: string;

  @Unique()
  @Property({ length: 100 })
  code!: string;

  @Property({
    columnType: "numeric(19,2)",
    type: NumericType
  })
  amount!: number;

  @Property({
    persist: false
  })
  amountUsed: number;

  @Property({
    columnType: "timestamptz"
  })
  startDate!: Date;

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  endDate?: Date;

  @Enum(() => PriceMeasurementType)
  type!: PriceMeasurementType;

  @Enum(() => DiscountUsage)
  usage!: DiscountUsage;

  @Property({
    columnType: "numeric(19,2)",
    type: NumericType,
    default: 0.0
  })
  unlockLimit: number = 0.0;

  @ManyToMany({
    entity: () => Hub,
    owner: true,
    mappedBy: "discounts",
    pivotTable: "discount_hub"
  })
	hubs = new Collection<Hub>(this);

  @OneToMany({
    entity: () => DiscountClient,
    mappedBy: "discount"
  })
  discountClients = new Collection<DiscountClient>(this);
}
