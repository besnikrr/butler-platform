import { eventProvider } from "@butlerhospitality/service-sdk";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Menu from "../entities/menu";
import { IMenuRepository, IProductMenuRepository } from "../repository";

export interface IDeleteMenuDependency {
  menuRepository: IMenuRepository;
  productMenuRepository: IProductMenuRepository;
}

export default (dependency: IDeleteMenuDependency) => {
  const { menuRepository, productMenuRepository } = dependency;
  return async (id: number): Promise<Menu> => {
    const menu = await menuRepository.getOneEntityOrFail(id, ["hotels"]);

    await productMenuRepository.nativeDelete({
      menu
    });

    menu.hotels.removeAll();

    await menuRepository.softDelete(id);
    await menuRepository.flush();

    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.DELETED, null, {
        id,
        entity: ENTITY.MENU.MENU
      }
    );

    return menu;
  };
};
