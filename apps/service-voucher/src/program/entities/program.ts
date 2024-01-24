
import { BaseEntity, IPublishableEntity, NumericType } from "@butlerhospitality/service-sdk";
import { AmountType, VoucherPayer, VoucherType } from "@butlerhospitality/shared";
import {
  Entity, Property, Enum, OneToMany, Collection, ManyToMany, Unique, Filter
} from "@mikro-orm/core";
import Hotel from "../../hotel/entities/hotel";
import Rule from "../../rule/entities/rule";
import { ProgramRepository } from "../repository";

export enum ProgramStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IProgram {
  name: string;
  description?: string;
  type: VoucherType;
  status: ProgramStatus;
  payer: string;
  payer_percentage: number;
  amount: number;
  amount_type: AmountType;
  code_limit?: number;
  oms_id?: number;
  hotels: Collection<Hotel>;
  rules?: Collection<Rule>;
}

export interface IProgramPublish extends IProgram, IPublishableEntity { }

@Filter({
  name: "programs",
  cond: (args) => ({
    $and: [
      {
        ...(args.status && { status: { $in: args.status } })
      },
      {
        ...(args.name && { name: { $ilike: args.name } })
      },
      {
        ...(args.type && { type: { $in: args.type } })
      }
    ]
  })
})
@Entity({ tableName: "program", customRepository: () => ProgramRepository })
export default class Program extends BaseEntity implements IProgram {
  @Property({ length: 255 })
  name!: string;

  @Property({ length: 500, nullable: true })
  description?: string;

  @Enum(() => VoucherType)
  type!: VoucherType;

  @Enum(() => ProgramStatus)
  status!: ProgramStatus;

  @Property({ length: 255 })
  payer!: VoucherPayer;

  @Property({
    type: NumericType,
    columnType: "numeric(19,2)"
  })
  payer_percentage!: number;

  @Property({
    type: NumericType,
    columnType: "numeric(19,2)"
  })
  amount!: number;

  @Enum(() => AmountType)
  amount_type!: AmountType;

  @Property({ nullable: true })
  code_limit?: number;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @ManyToMany({
    entity: () => Hotel,
    pivotTable: "program_hotel",
    mappedBy: "programs"
  })
  hotels: Collection<Hotel> = new Collection<Hotel>(this);

  @OneToMany({ entity: () => Rule, mappedBy: "program", orphanRemoval: true })
  rules = new Collection<Rule>(this);
}
