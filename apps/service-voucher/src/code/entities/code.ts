import {
  Entity, Property, ManyToOne, Filter, Unique
} from "@mikro-orm/core";
import { BaseEntity, CustomEntityRepository, NumericType } from "@butlerhospitality/service-sdk";
import Hotel from "../../hotel/entities/hotel";
import Program from "../../program/entities/program";

export enum CodeStatus {
  PENDING = "PENDING",
  REDEEMED = "REDEEMED",
}

@Entity({ tableName: "code", customRepository: () => CustomEntityRepository })
@Filter({
  name: "filterCodes",
  cond: (args) => ({
    $and: [
      {
        ...(args.type && { program: { type: { $in: args.type } } })
      },
      {
        ...(args.status && { claimed_date: args.status === CodeStatus.PENDING ? { $eq: null } : { $ne: null } })
      },
      {
        ...(args.fromDate && { created_at: { $gte: args.fromDate } })
      },
      {
        ...(args.toDate && { created_at: { $lt: args.toDate } })
      },
      {
        $or: [
          {
            ...(args.name && { program: { name: { $ilike: args.name } } })
          },
          {
            ...(args.name && { code: { $ilike: args.name } })
          }
        ]
      }
    ]
  })
})
export default class Code extends BaseEntity {
  @Property()
  code!: string;

  @ManyToOne()
  program!: Program;

  @Property({ nullable: true })
  order_id?: number;

  @ManyToOne()
  hotel!: Hotel;

  @Property({
    columnType: "numeric(19,2)",
    type: NumericType,
    default: 0.0
  })
  amount_used: number = 0.0;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ nullable: true })
  claimed_date?: Date;
}
