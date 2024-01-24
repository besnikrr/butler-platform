
import {
  EmptyBaseEntity, IntegerArray, NumericType
} from "@butlerhospitality/service-sdk";
import {
  Entity, ManyToOne, PrimaryKeyType, Property, Unique
} from "@mikro-orm/core";
import Category from "../../category/entities/category";
import Product from "../../product/entities/product";
import { ProductMenuRepository } from "../repository";
import Menu from "./menu";

@Entity({ tableName: "product_menu", customRepository: () => ProductMenuRepository })
@Unique({ options: ["category_id", "menu_id", "product_id"] })
export default class ProductMenu extends EmptyBaseEntity {
  @Property({
    columnType: "smallint",
    default: 0
  })
  sort_order = 0;

  @Property({
    columnType: "numeric (19,2)",
    type: NumericType,
    nullable: true
  })
  price?: number;

  @Property({
    default: false,
    type: "boolean"
  })
  is_popular = false;

  @Property({
    default: false,
    type: "boolean"
  })
  is_favorite = false;

  @Property({
    type: IntegerArray,
    columnType: "json[]",
    default: []
  })
  suggested_items: number[] = [];

  @ManyToOne({
    entity: () => Menu,
    inversedBy: "products",
    primary: true
  })
  menu: Menu;

  @ManyToOne({
    entity: () => Product,
    inversedBy: "productItems",
    primary: true
  })
  product: Product;

  @ManyToOne({
    entity: () => Category,
    inversedBy: "menuProducts",
    primary: true
  })
  category: Category;

  [PrimaryKeyType]: [number, number, number];
}
