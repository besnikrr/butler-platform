
import { NumericType, BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  BigIntType,
  Collection, Entity, ManyToMany, OneToMany, Property, Unique
} from "@mikro-orm/core";
import Category from "../../category/entities/category";
import Label from "../../label/entities/label";
import ProductMenu from "../../menu/entities/product-menu";
import Modifier from "../../modifier/entities/modifier";
import { ProductRepository } from "../repository";
import OutOfStock from "./out-of-stock";

export interface IProductPublish extends IPublishableEntity { }
export interface IOnDeleteProductPublish extends IPublishableEntity {
  id: string;
}

@Entity({ customRepository: () => ProductRepository })
export default class Product extends BaseEntity {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Property({
    columnType: "numeric (19,2)",
    type: NumericType
  })
  price!: number;

  @Property({
    default: false
  })
  needs_cutlery: boolean = false;

  @Property({
    default: false
  })
  guest_view: boolean = false;

  @Property({
    default: false
  })
  raw_food: boolean = false;

  @Property({ length: 50 })
  image!: string;

  @Property({ length: 255, default: process.env.IMAGE_BASE_URL })
  image_base_url = process.env.IMAGE_BASE_URL;

  @Property({ nullable: true, length: 500 })
  description?: string;

  @Property({ default: true })
  is_active: boolean = true;

  @ManyToMany({
    entity: () => Modifier,
    owner: true,
    pivotTable: "product_modifier",
    joinColumn: "product_id",
    inverseJoinColumn: "modifier_id",
    referenceColumnName: "id"
  })
  modifiers = new Collection<Modifier>(this);

  @ManyToMany({
    entity: () => Category,
    owner: true,
    pivotTable: "product_category",
    joinColumn: "product_id",
    inverseJoinColumn: "category_id",
    referenceColumnName: "id"
  })
  categories = new Collection<Category>(this);

  @OneToMany({
    entity: () => ProductMenu,
    mappedBy: (productMenu) => productMenu.product
  })
  productItems = new Collection<ProductMenu>(this);

  @OneToMany({
    entity: () => OutOfStock,
    mappedBy: "product"
  })
  out_of_stock = new Collection<OutOfStock>(this);

  @ManyToMany({
    entity: () => Label,
    owner: true,
    pivotTable: "product_labels",
    joinColumn: "product_id",
    inverseJoinColumn: "label_id",
    referenceColumnName: "id"
  })
  labels = new Collection<Label>(this);
}
