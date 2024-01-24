import { eventProvider } from "@butlerhospitality/service-sdk";
import { PRODUCT_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IProductMenuRepository } from "../../menu/repository";
import { IOnDeleteProductPublish } from "../entities/product";
import { IProductRepository } from "../repository";

export interface IDeleteProductDependency {
  productRepository: IProductRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: IDeleteProductDependency) => {
  const { productRepository, productMenuRepository } = dependency;
  return async (id: number): Promise<boolean> => {
    const product = await productRepository.getOneEntityOrFail({ id }, [
      "modifiers", "categories", "productItems", "labels"
    ]);

    const eventData = product.productItems.toArray().map((el) => {
      return {
        id: el.menu,
        entity: ENTITY.MENU.MENU
      };
    });
    eventData.push({
      id,
      entity: ENTITY.MENU.PRODUCT
    });

    product.modifiers.removeAll();
    product.categories.removeAll();
    product.labels.removeAll();

    await productMenuRepository.nativeDelete({
      product
    });

    const deleted = await productRepository.softDelete(id);
    await eventProvider.client()
      .publish<IOnDeleteProductPublish>(SNS_TOPIC.MENU.PRODUCT, PRODUCT_EVENT.DELETED, null, eventData);

    return deleted;
  };
};
