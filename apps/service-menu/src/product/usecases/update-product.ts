/* eslint-disable indent */
/* eslint-disable no-case-declarations */
import { BadRequestError, eventProvider } from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";
import {
  IsBoolean, IsOptional, IsNumber, IsString, IsNotEmpty, IsArray, ArrayNotEmpty, MaxLength, IsPositive
} from "class-validator";
import { PRODUCT_EVENT, ENTITY, SNS_TOPIC, MENU_EVENT } from "@butlerhospitality/shared";
import { IProductPublish } from "../entities/product";
import { IProductRepository } from "../repository";
import { IMenuRepository, IProductMenuRepository } from "../../menu/repository";
import { ICategoryRepository } from "../../category/repository";
import { IModifierRepository } from "../../modifier/repository";
import { IMenuPublish } from "../../menu/entities/menu";
import { ILabelRepository } from "../../label/repository";

export interface IUpdateProductInformationInput {
  oms_id?: number;
  name: string;
  price: number;
  needs_cutlery: boolean;
  guest_view: boolean;
  raw_food: boolean;
  image: string;
  description?: string;
}
export class UpdateProductInformationInput implements IUpdateProductInformationInput {
  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  needs_cutlery: boolean;

  @IsBoolean()
  @IsNotEmpty()
  guest_view: boolean;

  @IsBoolean()
  @IsNotEmpty()
  raw_food: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  image: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export interface IUpdateProductCategoriesInput {
  categories: number[];
}

export class UpdateProductCategoriesInput implements IUpdateProductCategoriesInput {
  @IsArray({ message: "Categories must be a number array" })
  @ArrayNotEmpty()
  categories: number[];
}

export interface IUpdateProductLabelsInput {
  labels: number[];
}

export class UpdateProductLabelsInput implements IUpdateProductLabelsInput {
  @IsArray({ message: "Labels must be a number array" })
  labels: number[];
}

export interface IUpdateProductModifiersInput {
  modifiers: number[];
}

export class UpdateProductModifiersInput implements IUpdateProductModifiersInput {
  @IsArray({ message: "Modifiers must be a number array" })
  modifiers: number[];
}

export interface IUpdateProductDependency {
  productRepository: IProductRepository;
  productMenuRepository: IProductMenuRepository;
  categoryRepository: ICategoryRepository;
  modifierRepository: IModifierRepository;
  menuRepository: IMenuRepository;
  labelRepository: ILabelRepository
}

export enum ProductUpdateType {
  CATEGORIES = "categories",
  MODIFIERS = "modifiers",
  GENERAL_INFORMATION = "general",
  LABELS = "labels"
}

export interface IProductUpdatePublish extends IProductPublish {
  type?: ProductUpdateType;
}

export default (dependency: IUpdateProductDependency) => {
  const {
    productRepository, productMenuRepository,
    categoryRepository, modifierRepository, menuRepository, labelRepository
  } = dependency;
  return async (
    id: number,
    updateType: ProductUpdateType,
    data: UpdateProductInformationInput | UpdateProductCategoriesInput | UpdateProductModifiersInput
      | UpdateProductLabelsInput
  ) => {
    const product = await productRepository.getOneEntityOrFail(id, ["productItems"]);
    const menusIdsUpdated = new Set();
    switch (updateType) {
      case ProductUpdateType.GENERAL_INFORMATION:
        const generalInformationData = data as UpdateProductInformationInput;

        if (generalInformationData.price !== product.price) {
          for (const productItem of product.productItems) {
            if (productItem.price < generalInformationData.price) {
              productItem.price = generalInformationData.price;
              menusIdsUpdated.add(productItem.menu.id);
            }
          }
        }

        wrap(product).assign(generalInformationData);
        await productRepository.flush();
        break;

      case ProductUpdateType.CATEGORIES:
        const categoriesData = data as UpdateProductCategoriesInput;
        await categoryRepository.getEntitiesOrFailIfNotFound(categoriesData.categories);
        wrap(product).assign({ categories: categoriesData.categories });

        await productMenuRepository.nativeDelete({
          product,
          category: {
            $nin: categoriesData.categories
          }
        });

        await productRepository.flush();
        break;

      case ProductUpdateType.MODIFIERS:
        const modifiersData = data as UpdateProductModifiersInput;
        await modifierRepository.getEntitiesOrFailIfNotFound(modifiersData.modifiers);
        wrap(product).assign({ modifiers: modifiersData.modifiers });
        await productRepository.flush();
        break;

      case ProductUpdateType.LABELS:
        const labelsData = data as UpdateProductLabelsInput;
        await labelRepository.getEntitiesOrFailIfNotFound(labelsData.labels);
        wrap(product).assign({ labels: labelsData.labels });
        await productRepository.flush();
        break;

      default:
        throw new BadRequestError(updateType ? "Wrong update type provided" : "No update type provided");
    }

    await eventProvider.client().publish<IProductUpdatePublish>(
      SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.UPDATED, null, {
      ...product,
      type: updateType,
      entity: ENTITY.MENU.PRODUCT
    }
    );
    if (menusIdsUpdated.size > 0) {
      const menuIdsArray = [...menusIdsUpdated];
      const updatedMenus = await menuRepository.find(menuIdsArray as number[]);
      const menusToSend = updatedMenus.map((menu) => {
        return { ...menu, entity: ENTITY.MENU.MENU };
      });
      await eventProvider.client().publish<IMenuPublish>(SNS_TOPIC.MENU.MENU, MENU_EVENT.UPDATED, null, menusToSend);
    }

    return productRepository.populate(product, ["categories", "modifiers"]);
  };
};
