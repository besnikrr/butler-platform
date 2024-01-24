import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import createMenu, { ICreateMenuInput } from "./create-menu";
import updateMenu, { IUpdateMenuInput } from "./update-menu";
import listMenu, { MenuFilter } from "./list-menu";
import getMenu, { FormattedMenuResponse } from "./get-menu";
import getHotelMenu from "./get-hotel-menu";
import deleteMenu from "./delete-menu";
import duplicateMenu from "./duplicate-menu";
import listMenuHotels from "./list-menu-hotels";
import assignMenuHotels, { IAssignMenuHotelsInput } from "./assign-menu-hotels";
import batchUpdateMenus, { IBatchUpdateMenuInput } from "./batch-update-menus";

import Menu from "../entities/menu";
import ProductMenu from "../entities/product-menu";
import Hotel from "../../hotel/entities/hotel";
import Product from "../../product/entities/product";
import Category from "../../category/entities/category";
import pushMenuToProduction from "./push-menu-to-production";
import { IMenuRepository, IProductMenuRepository } from "../repository";
import { IProductRepository } from "../../product/repository";
import { ICategoryRepository } from "../../category/repository";
import { IHotelRepository } from "../../hotel/repository";

export interface MenuUseCase {
  createMenu(menu: ICreateMenuInput): Promise<Menu>;
  updateMenu(id: number, menu: IUpdateMenuInput): Promise<Menu>;
  listMenu(req: MenuFilter): Promise<[Menu[], number]>;
  getMenu(id: number, formatted: boolean): Promise<Menu | FormattedMenuResponse>;
  getHotelMenu(id: number, formatted: boolean): Promise<Menu | FormattedMenuResponse>;
  deleteMenu(id: number): Promise<Menu>;
  duplicateMenu(id: number): Promise<Menu>;
  listMenuHotels(id: number, hotelIDs?: number[] | string[]): Promise<Hotel[]>;
  assignMenuHotels(id: number, input: IAssignMenuHotelsInput): Promise<Menu>;
  batchUpdateMenus(input: IBatchUpdateMenuInput): Promise<Menu[]>;
  pushMenuToProduction(id: number): Promise<Menu>;
}

export default (dependency: IDefaultUsecaseDependency): MenuUseCase => {
  const { conn } = dependency;
  return {
    listMenu: listMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository
    }),
    getMenu: getMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository
    }),
    getHotelMenu: getHotelMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository
    }),
    createMenu: createMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    updateMenu: updateMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    deleteMenu: deleteMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    duplicateMenu: duplicateMenu({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    listMenuHotels: listMenuHotels({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository
    }),
    batchUpdateMenus: batchUpdateMenus({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    assignMenuHotels: assignMenuHotels({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      hotelRepository: conn.em.getRepository(Hotel) as IHotelRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository
    }),
    pushMenuToProduction: pushMenuToProduction({
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository
    })
  };
};
