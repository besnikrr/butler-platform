import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import Hotel from "../entities/hotel";
import listHotels, { HotelFilter } from "./list-hotels";

export interface HotelUseCase {
  listHotels(filters: HotelFilter): Promise<[Hotel[], number]>;
}

export default (dependency: IDefaultUsecaseDependency): HotelUseCase => {
  const { conn } = dependency;
  return {
    listHotels: listHotels({
      hotelRepository: conn.em.getRepository(Hotel)
    })
  };
};
