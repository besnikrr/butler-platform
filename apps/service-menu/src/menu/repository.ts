
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Menu from "./entities/menu";
import ProductMenu from "./entities/product-menu";

export interface IMenuRepository extends CustomEntityRepository<Menu> { }
export class MenuRepository extends CustomEntityRepository<Menu> implements IMenuRepository { }

export interface IProductMenuRepository extends CustomEntityRepository<ProductMenu> { }
export class ProductMenuRepository extends CustomEntityRepository<ProductMenu> implements IProductMenuRepository { }
