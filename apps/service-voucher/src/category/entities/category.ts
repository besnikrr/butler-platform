
import {
  Entity, Property, ManyToOne, Unique, OneToMany, Collection, ManyToMany, Filter, DateType
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import Rule from "../../rule/entities/rule";
import { CategoryRepository } from "../repository";

@Filter({
  name: "ongoing",
  cond: () => ({
    $or: [
      {
        $and: [
          {
            start_date: { $eq: null }
          },
          {
            end_date: { $eq: null }
          }
        ]
      },
      {
        $and: [
          {
            end_date: { $gte: new Date() }
          }
        ]
      }
    ]
  })
})
@Entity({ tableName: "category", customRepository: () => CategoryRepository })
export default class Category extends BaseEntity {
  @Property({ primary: true })
  id!: number;

  @Property()
  name!: string;

  @Property({ type: DateType, columnType: "date", nullable: true })
  start_date?: Date;

  @Property({ type: DateType, columnType: "date", nullable: true })
  end_date?: Date;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @ManyToOne({
    entity: () => Category,
    joinColumn: "parent_category_id",
    inversedBy: "sub_categories",
    nullable: true
  })
  parent_category?: Category;

  @OneToMany({
    entity: () => Category,
    mappedBy: "parent_category"
  })
  sub_categories?: Collection<Category> = new Collection<Category>(this);

  @ManyToMany(() => Rule, (rule) => rule.categories, { pivotTable: "rule_category" })
  rules = new Collection<Rule>(this);
}
