
import { eventProvider } from "@butlerhospitality/service-sdk";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Menu, { IMenuPublish, MENU_STATUS } from "../entities/menu";
import { IMenuRepository, IProductMenuRepository } from "../repository";

export interface IDuplicateMenuDependency {
  menuRepository: IMenuRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: IDuplicateMenuDependency) => {
  const { menuRepository, productMenuRepository } = dependency;
  return async (id: number): Promise<Menu> => {
    const menu = await menuRepository.getOneEntityOrFail(id, ["products", "hotels"]);

    const { name, products } = menu;

    const duplicatedMenu = menuRepository.create({
      name: `${name} Copy`,
      status: MENU_STATUS.INACTIVE
    });

    for (const product of products) {
      const newProduct = productMenuRepository.create({
        price: product.price,
        sort_order: product.sort_order,
        is_favorite: product.is_favorite,
        is_popular: product.is_popular,
        suggested_items: product.suggested_items, // confirm this
        category: product.category,
        product: product.product
      });

      duplicatedMenu.products.add(newProduct);
    }

    await menuRepository.persistAndFlush(duplicatedMenu);
    await eventProvider.client().publish<IMenuPublish>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.CREATED, null, {
        ...duplicatedMenu,
        entity: ENTITY.MENU.MENU
      }
    );

    return duplicatedMenu;
  };
};
