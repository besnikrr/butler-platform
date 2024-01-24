import { EntityManager } from "@mikro-orm/postgresql";
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import Hotel from "../entities/hotel";
import getProgramHotels, { IProgramFilter } from "./get-program-hotels";
import getHotel from "./get-hotel";
import getHotels, { IHotelFilter } from "./get-list-hotels";
import { IHotelRepository } from "../repository";

export interface HotelUsecase {
  getProgramHotels(filters: IProgramFilter): Promise<[Hotel[], number]>;
  getHotel(hotel_id: number): Promise<Hotel>;
  getHotels(req: IHotelFilter): Promise<[Hotel[], number]>;
}

export default (dependency: IDefaultUsecaseDependency): HotelUsecase => {
  const { conn } = dependency;
  return {
    getProgramHotels: getProgramHotels({
      knex: (conn.em as EntityManager).getKnex()
    }),
    getHotel: getHotel({
      hotelRepository: conn.em.getRepository(Hotel) as IHotelRepository
    }),
    getHotels: getHotels({
      hotelRepository: conn.em.getRepository(Hotel) as IHotelRepository
    })
  };
};
