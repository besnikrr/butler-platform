import { eventProvider } from "@butlerhospitality/service-sdk";
import { Type } from "class-transformer";
import {
  ArrayNotEmpty, ValidateNested, IsBoolean,
  IsNotEmpty, IsNumber, IsOptional, IsArray, IsPositive
} from "class-validator";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Menu, { IMenuPublish } from "../entities/menu";
import { IPartialProduct } from "./create-menu";
import { IMenuRepository, IProductMenuRepository } from "../repository";
import { IProductRepository } from "../../product/repository";
import { ICategoryRepository } from "../../category/repository";

export interface IBatchUpdateMenuInput {
  menu_ids: number[];
  products: IPartialProduct[];
}

export class PartialProductInput implements IPartialProduct {
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  price?: number;

  @IsBoolean()
  @IsOptional()
  is_popular?: boolean;

  @IsBoolean()
  @IsOptional()
  is_favorite?: boolean;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsArray()
  @IsOptional()
  suggested_items: number[];

  @IsNumber()
  @IsOptional()
  @IsPositive()
  sort_order?: number;
}

export class BatchUpdateMenuInput implements IBatchUpdateMenuInput {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  menu_ids: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialProductInput)
  @IsNotEmpty()
  products: PartialProductInput[];
}

export interface IBatchUpdateMenuDependency {
  menuRepository: IMenuRepository;
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: IBatchUpdateMenuDependency) => {
  const {
    menuRepository, productRepository,
    categoryRepository, productMenuRepository
  } = dependency;
  return async (input: IBatchUpdateMenuInput): Promise<Menu[]> => {
    const menus = await menuRepository.getEntitiesOrFailIfNotFound(input.menu_ids, ["products"]);

    for (const menu of menus) {
      for (const product of input.products) {
        if (
          !menu.products
            .getItems()
            .some(
              (a) => a.product.id === product.product_id &&
                a.menu.id === menu.id && a.category.id === product.category_id
            )
        ) {
          const productMenu = productMenuRepository.create(product);
          productMenu.category = categoryRepository.getReference(product.category_id);
          productMenu.product = productRepository.getReference(product.product_id);

          menu.products.add(productMenu);
        }
      }

      await eventProvider.client().publish<IMenuPublish>(
        SNS_TOPIC.MENU.MENU, MENU_EVENT.UPDATED, null, {
          ...menu,
          entity: ENTITY.MENU.MENU
        }
      );
    }

    await menuRepository.flush();

    return menus;
  };
};
