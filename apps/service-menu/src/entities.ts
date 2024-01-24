import { BaseEntity, AuditBaseEntity } from "@butlerhospitality/service-sdk";
import Hub from "./hub/entities/hub";
import Hotel from "./hotel/entities/hotel";
import Category from "./category/entities/category";
import ModifierOption from "./modifier/entities/modifier-option";
import Modifier from "./modifier/entities/modifier";
import Product from "./product/entities/product";
import OutOfStock from "./product/entities/out-of-stock";
import Menu from "./menu/entities/menu";
import ProductMenu from "./menu/entities/product-menu";
import Label from "./label/entities/label";

const MenuEntitiesObject = {
  BaseEntity,
  AuditBaseEntity,
  Hub,
  Hotel,
  Category,
  Product,
  Modifier,
  ModifierOption,
  Menu,
  ProductMenu,
  OutOfStock,
  Label
};

export const MenuEntities = {
  asArray: () => {
    return Object.values(MenuEntitiesObject);
  },
  asObject: () => {
    return MenuEntitiesObject;
  }
};
