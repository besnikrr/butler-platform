
import { eventProvider } from "@butlerhospitality/service-sdk";
import { Type } from "class-transformer";
import {
  IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested
} from "class-validator";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Menu, { IMenuPublish } from "../entities/menu";
import { PartialProductInput } from "./batch-update-menus";
import { IMenuRepository, IProductMenuRepository } from "../repository";
import { IProductRepository } from "../../product/repository";
import { ICategoryRepository } from "../../category/repository";

export interface ICreateMenuInput {
  oms_id?: number;
  name: string;
  products: IPartialProduct[];
}

export interface IPartialProduct {
  product_id: number;
  price?: number;
  is_popular?: boolean;
  is_favorite?: boolean;
  category_id: number;
  suggested_items: number[];
  sort_order?: number;
}

export class CreateMenuInput implements ICreateMenuInput {
  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialProductInput)
  @IsNotEmpty()
  products: PartialProductInput[];
}

export interface ICreateMenuDependency {
  menuRepository: IMenuRepository;
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: ICreateMenuDependency) => {
  const {
    menuRepository, productRepository, categoryRepository, productMenuRepository
  } = dependency;
  return async (data: ICreateMenuInput): Promise<Menu> => {
    const menu = menuRepository.create({ name: data.name });

    for (const product of data.products) {
      const productMenu = productMenuRepository.create(product);

      productMenu.category = categoryRepository.getReference(product.category_id);
      productMenu.product = productRepository.getReference(product.product_id);
      menu.products.add(productMenu);
    }

    await menuRepository.persistAndFlush(menu);

    await eventProvider.client().publish<IMenuPublish>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.CREATED, null, {
        ...menu,
        entity: ENTITY.MENU.MENU
      }
    );

    return menuRepository.populate(menu, "products");
  };
};
