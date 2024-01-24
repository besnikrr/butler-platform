
import { BaseEntity, IBaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import {
  Entity,
  ManyToOne,
  Property
} from "@mikro-orm/core";
import { DiscountClientRepository } from "../repositories/discount-client";
import Discount from "./discount";

export interface IDiscountClient extends IBaseEntity {
  discount: Discount;
  omsId?: number;
  amountUsed: number;
  clientPhoneNumber: string;
}

@Entity({
  customRepository: () => DiscountClientRepository
})
export default class DiscountClient extends BaseEntity implements IDiscountClient {
  @ManyToOne({
    entity: () => Discount,
    inversedBy: "discountClients"
  })
  discount!: Discount;

  @Property({
    unique: true,
    columnType: "bigint",
    nullable: true
  })
  omsId?: number;

  @Property({
    columnType: "numeric(19,2)",
    type: NumericType
  })
  amountUsed!: number;

  @Property({
    length: 50
  })
  clientPhoneNumber!: string;
}
