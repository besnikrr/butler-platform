
import { eventProvider } from "@butlerhospitality/service-sdk";
import { IsArray, IsNumber, IsOptional } from "class-validator";
import { MENU_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Menu, { IAssignMenuHotelPublish } from "../entities/menu";
import { IMenuRepository } from "../repository";
import { IHotelRepository } from "../../hotel/repository";
import { ICategoryRepository } from "../../category/repository";

export interface IAssignMenuHotelsInput {
  hotel_ids: number[];
}

export class AssignMenuHotelsInput implements IAssignMenuHotelsInput {
  @IsArray()
  @IsNumber({}, { each: true, message: "Hotel ids must be a number array" })
  @IsOptional()
  hotel_ids: number[];
}

export interface IAssignMenuHotelsDependency {
  menuRepository: IMenuRepository;
  hotelRepository: IHotelRepository;
  categoryRepository: ICategoryRepository;
}

export default (dependency: IAssignMenuHotelsDependency) => {
  const { menuRepository, hotelRepository, categoryRepository } = dependency;
  return async (id: number, input: IAssignMenuHotelsInput): Promise<Menu> => {
    const menu = await menuRepository.getOneEntityOrFail(id, ["hotels"]);
    const categories = await categoryRepository.find({
      parent_category: { $eq: null },
      subcategories: { menuProducts: { menu: { $eq: id } } }
    });

    const previousHotelIds = menu.hotels.getIdentifiers();
    const hotelIds = [...new Set(previousHotelIds.concat(input.hotel_ids))];

    const hotels = await hotelRepository.find(hotelIds, ["menus.hotels"]);

    for (const hotel of hotels) {
      for (const hotelMenu of hotel.menus) {
        hotelMenu.hotels.remove(hotel);
      }

      if (input.hotel_ids.includes(hotel.id)) {
        hotel.menus.add(menu);
      }
    }

    await menuRepository.flush();

    await eventProvider.client().publish<IAssignMenuHotelPublish>(
      SNS_TOPIC.MENU.MENU, MENU_EVENT.HOTELS_ASSIGNED, null, {
        ...menu,
        unassignedHotelIds: previousHotelIds,
        categories,
        entity: ENTITY.MENU.MENU
      });

    return menuRepository.populate(menu, "hotels");
  };
};
