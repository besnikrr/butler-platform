
import {
  Entity, Property, Collection, ManyToMany, ManyToOne, Unique
} from "@mikro-orm/core";
import { BaseEntity, NumericType } from "@butlerhospitality/service-sdk";
import Category from "../../category/entities/category";
import Program from "../../program/entities/program";
import { RuleRepository } from "../repository";

export interface IRule {
  id?: number;
  quantity: number;
  max_price?: number;
  program: Program;
  oms_id?: number;
  categories: Collection<Category>;
}
@Entity({ tableName: "rule", customRepository: () => RuleRepository })
export default class Rule extends BaseEntity implements IRule {
  @Property({ default: 1 })
  quantity!: number;

  @Property({ nullable: true, type: NumericType })
  max_price?: number;

  @ManyToOne({ entity: () => Program })
  program!: Program;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @ManyToMany({ entity: () => Category, mappedBy: "rules", owner: true, pivotTable: "rule_category" })
  categories: Collection<Category> = new Collection<Category>(this);
}
