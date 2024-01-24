import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { User } from "../../user/entity";

@Entity()
export class OrderMeta extends BaseEntity {
  @Property({ nullable: true })
  hubId?: number;

  @Property({ length: 255, nullable: true })
  hubName?: string;

  @Property({
    length: 50,
    nullable: true
  })
  hubColor?: string;

  @Property({ nullable: true })
  hotelId?: number;

  @Property({ length: 255, nullable: true })
  hotelName?: string;

  @Property({ length: 255, nullable: true })
  roomNumber?: string;

  @Property({ nullable: true })
  pmsId?: number;

  @Property({ columnType: "smallint", nullable: true })
  cutlery?: number;

  @ManyToOne({
    entity: () => User,
    nullable: true,
    eager: true
  })
  foodCarrier?: User;

  @ManyToOne({
    entity: () => User,
    nullable: true,
    eager: true
  })
  dispatcher?: User;

  @Property({
    columnType: "timestamptz",
    nullable: true
  })
  assignDate?: Date;

  @Property({
    nullable: true,
    type: NumericType
  })
  taxRate?: number;
}
