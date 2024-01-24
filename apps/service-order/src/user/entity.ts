import { BaseEntity } from "@butlerhospitality/service-sdk";
import {
  Entity, Property, Unique, Enum
} from "@mikro-orm/core";
import { UserRepository } from "../order/repositories/user";

export enum CarrierStatus {
  ON_SITE = "ON_SITE",
  RETURNING = "RETURNING",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  IDLE = "IDLE"
}

export enum Carrier {
  FOOD_CARRIER = "FOOD_CARRIER",
  DISPATCHER = "DISPATCHER"
}

@Entity({
  customRepository: () => UserRepository,
  tableName: "iam_user"
})
export class User extends BaseEntity {
  @Property()
  userId!: number;

  @Property({ length: 255 })
  name!: string;

  @Unique()
  @Property()
  email!: string;

  @Enum(() => CarrierStatus)
  carrierStatus: CarrierStatus;

  @Enum({
    items: () => Carrier,
    nullable: true
  })
  role?: Carrier;
}
