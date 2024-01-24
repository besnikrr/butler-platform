
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import getList, { HotelFilter } from "./list-hotels";
import createSingle, { ICreateHotelInput, ICreateHotelOutput } from "./create-hotel";
import updateSingle, { IUpdateHotelInput, IUpdateHotelOutput } from "./update-hotel";
import getSingle from "./get-hotel";
import Hotel from "../entity";
import deleteHotel from "./delete-hotel";
import changeStatusHotel from "./change-status-hotel";
import Hub from "../../hub/entity";

export interface HotelUsecase {
  listHotels(req: HotelFilter): Promise<[Hotel[], number]>;
  createHotel(data: ICreateHotelInput): Promise<ICreateHotelOutput>;
  updateHotel(id: number, data: IUpdateHotelInput): Promise<IUpdateHotelOutput>;
  getHotel(id: number): Promise<Hotel>;
  deleteHotel(id: number): Promise<boolean>;
  changeStatusHotel(id: number, status: boolean): Promise<Hotel>;
}

export default (dep: IDefaultUsecaseDependency): HotelUsecase => {
  const { conn } = dep;
  return {
    listHotels: getList({
      hotelRepository: conn.em.getRepository(Hotel)
    }),
    createHotel: createSingle({
      hotelRepository: conn.em.getRepository(Hotel),
      hubRepository: conn.em.getRepository(Hub)
    }),
    updateHotel: updateSingle({
      hotelRepository: conn.em.getRepository(Hotel),
      hubRepository: conn.em.getRepository(Hub)
    }),
    getHotel: getSingle({
      hotelRepository: conn.em.getRepository(Hotel)
    }),
    deleteHotel: deleteHotel({
      hotelRepository: conn.em.getRepository(Hotel)
    }),
    changeStatusHotel: changeStatusHotel({
      hotelRepository: conn.em.getRepository(Hotel)
    })
  };
};
