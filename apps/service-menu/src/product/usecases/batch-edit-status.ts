
import { eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, PRODUCT_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import {
  ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsPositive
} from "class-validator";
import { IProductMenuRepository } from "../../menu/repository";
import Product, { IProductPublish } from "../entities/product";
import { IProductRepository } from "../repository";

export interface IBatchEditProductStatusInput {
  ids: number[];
  is_active: boolean;
}

export class BatchEditProductStatusInput implements IBatchEditProductStatusInput {
  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  ids: number[];

  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}

export interface IBatchEditProductDependency {
  productRepository: IProductRepository;
	productMenuRepository?: IProductMenuRepository;
}

export default (dependency: IBatchEditProductDependency) => {
  const { productRepository, productMenuRepository } = dependency;
  return async (data: IBatchEditProductStatusInput): Promise<Product[]> => {
    const products = await productRepository.find({
      id: {
        $in: data.ids
      }
    }, {
      populate: ["productItems.menu"]
    });

    const eventData = [];
    const productItems = [];
    for (const product of products) {
      product.is_active = data.is_active;
      eventData.push({
        entity: ENTITY.MENU.PRODUCT,
        ...product
      });

      if (product.productItems.length && !product.is_active) {
        product.productItems.getItems().forEach((productMenu) => {
          eventData.push({
            entity: ENTITY.MENU.MENU,
            id: productMenu.menu.id
          });
          productItems.push(productMenu);
        });
      }
    }

    if (productItems.length) {
      await productMenuRepository.nativeDelete(productItems);
    }

    await productRepository.flush();

    await eventProvider.client().publish<IProductPublish[]>(
      SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.STATUS_CHANGED, null, eventData);
    return products;
  };
};
