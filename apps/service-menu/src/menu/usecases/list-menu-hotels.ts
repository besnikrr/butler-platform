import Hotel from "../../hotel/entities/hotel";
import { IMenuRepository } from "../repository";

export interface IListMenuHotelsDependency {
  menuRepository: IMenuRepository;
}

export default (dependency: IListMenuHotelsDependency) => {
  const { menuRepository } = dependency;
  return async (id: number, hotelIDs: number[] = []): Promise<Hotel[]> => {
    const menu = await menuRepository.getOneEntityOrFail(id, ["hotels", "hotels.hub"]);

    return hotelIDs.length > 0 ?
      menu.hotels.getItems().filter((hotel) => hotelIDs.includes(hotel.id)) :
      menu.hotels.getItems();
  };
};
