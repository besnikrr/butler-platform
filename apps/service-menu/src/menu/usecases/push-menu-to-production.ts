import axios from "axios";
import { BadRequestError, eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, MENU_EVENT, SNS_TOPIC, STAGE } from "@butlerhospitality/shared";
import Menu, { IMenuPublish, MENU_STATUS } from "../entities/menu";
import { getWebMenuGenerationUrl } from "../../utils/util";
import { IMenuRepository } from "../repository";
import { wrap } from "@mikro-orm/core";

export const regenerateWebMenu = async (stage: STAGE, hotelId?: number) => {
  const generateWebMenuUrl = getWebMenuGenerationUrl(stage);

  await axios({
    url: hotelId ? `${generateWebMenuUrl}/cache-web-menu/${hotelId}` : `${generateWebMenuUrl}/cache-web-menu`,
    method: "GET",
    headers: {}
  });
};

export interface IPushMenuToProductionDependency {
  menuRepository: IMenuRepository;
}

export default (dependency: IPushMenuToProductionDependency) => {
  const { menuRepository } = dependency;
  return async (menuId: number, hotelId?: number): Promise<Menu> => {
    if (!process.env.STAGE || !Object.keys(STAGE).includes(process.env.STAGE)) {
      throw new BadRequestError(
        `Push menu to production is not supported for this stage of the app -> ${process.env.STAGE}`
      );
    }
    const menu = await menuRepository.getOneEntityOrFail(menuId, ["hotels"]);

    if (menu.hotels.count() < 1) {
      throw new BadRequestError("Menu must have at least one assigned hotel before pushing to production");
    }

    wrap(menu).assign({ status: MENU_STATUS.ACTIVE });
    await menuRepository.flush();
    await eventProvider.client().publish<IMenuPublish>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.UPDATED, null, {
        ...menu,
        entity: ENTITY.MENU.MENU
      }
    );
    return menu;
  };
};
