import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength
} from "class-validator";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { PRODUCT_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IProductPublish } from "../entities/product";
import { IProductRepository } from "../repository";
import { ICategoryRepository } from "../../category/repository";
import { IModifierRepository } from "../../modifier/repository";
import { ILabelRepository } from "../../label/repository";

export interface ICreateProductInput {
  name: string;
  price: number;
  needs_cutlery: boolean;
  guest_view: boolean;
  raw_food: boolean;
  image: string;
  description: string;
  categories: number[];
  modifiers: number[];
  labels: number[]
}

export class CreateProductInput implements ICreateProductInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsNotEmpty()
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
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  categories: number[];

  @IsArray()
  @IsOptional()
  modifiers: number[];

  @IsArray()
  @IsOptional()
  labels: number[];
}

export interface ICreateProductDependency {
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
  modifierRepository: IModifierRepository;
  labelRepository: ILabelRepository
}

export default (dependency: ICreateProductDependency) => {
  const {
    productRepository, categoryRepository, modifierRepository, labelRepository
  } = dependency;
  return async (data: ICreateProductInput) => {
    await categoryRepository.getEntitiesOrFailIfNotFound(data.categories?.length !== 0 ? data.categories : []);
    await modifierRepository.getEntitiesOrFailIfNotFound(data.modifiers?.length !== 0 ? data.modifiers : []);
    await labelRepository.getEntitiesOrFailIfNotFound(data.labels?.length !== 0 ? data.labels : []);

    const product = productRepository.create(data);
    await productRepository.persistAndFlush(product);

    await eventProvider.client().publish<IProductPublish>(
      SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.CREATED, null, {
        ...product,
        entity: ENTITY.MENU.PRODUCT
      }
    );

    return productRepository.populate(product, ["categories", "modifiers"]);
  };
};
