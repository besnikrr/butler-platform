
import { eventProvider } from "@butlerhospitality/service-sdk";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { ICategoryRepository } from "../../category/repository";
import { IProductRepository } from "../../product/repository";
import Menu, { IMenuPublish } from "../entities/menu";
import { IMenuRepository, IProductMenuRepository } from "../repository";
import { CreateMenuInput, ICreateMenuInput } from "./create-menu";

export interface IUpdateMenuInput extends ICreateMenuInput {}

export class UpdateMenuInput extends CreateMenuInput implements IUpdateMenuInput {}

export interface IUpdateMenuDependency {
  menuRepository: IMenuRepository;
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: IUpdateMenuDependency) => {
  const {
    menuRepository, productRepository, categoryRepository, productMenuRepository
  } = dependency;
  return async (id: number, data: IUpdateMenuInput): Promise<Menu> => {
    const { products, ...dataToUpdate } = data;
    const menu = await menuRepository.getOneEntityOrFail(id, ["products"]);
    menuRepository.assign(menu, { ...dataToUpdate });
    await productMenuRepository.nativeDelete({ menu });

    for (const product of products) {
      const productMenu = productMenuRepository.create(product);
      productMenu.category = categoryRepository.getReference(product.category_id);
      productMenu.product = productRepository.getReference(product.product_id);
      menu.products.add(productMenu);
    }

    await menuRepository.flush();
    await eventProvider.client().publish<IMenuPublish>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.UPDATED, null, {
        ...menu,
        entity: ENTITY.MENU.MENU
      }
    );

    return menuRepository.populate(menu, "products");
  };
};
