import { BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  Entity, ManyToOne, Property, Collection,
  OneToMany, ManyToMany, DateType, Unique, BigIntType
} from "@mikro-orm/core";
import ProductMenu from "../../menu/entities/product-menu";
import Product from "../../product/entities/product";
import { CategoryRepository } from "../repository";

export interface ICategoryPublish extends IPublishableEntity { }
export interface IOnDeleteCategoryPublish extends IPublishableEntity {
  id: string;
}

@Entity({
  customRepository: () => CategoryRepository
})
export default class Category extends BaseEntity {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ columnType: "date", nullable: true, type: DateType })
  start_date?: Date;

  @Property({ columnType: "date", nullable: true, type: DateType })
  end_date?: Date;

  @Property()
  parent_category_id!: number;

  @ManyToOne({
    entity: () => Category,
    joinColumn: "parent_category_id",
    inversedBy: "subcategories",
    nullable: true
  })
  parent_category?: Category;

  @OneToMany({
    entity: () => Category,
    mappedBy: "parent_category",
    orphanRemoval: true
  })
  subcategories? = new Collection<Category>(this);

  @OneToMany({
    entity: () => ProductMenu,
    mappedBy: (productMenu) => productMenu.category,
    orphanRemoval: true
  })
  menuProducts = new Collection<ProductMenu>(this);

  @ManyToMany({
    entity: () => Product,
    mappedBy: (product) => product.categories
  })
  items = new Collection<Product>(this);
}
