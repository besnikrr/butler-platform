import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import getList, { IHubFilter } from "./list-hubs";
import createHub, { ICreateHubInput, ICreateHubOutput } from "./create-hub";
import updateHub, { IUpdateHubInput, IUpdateHubOutput } from "./update-hub";
import getHub from "./get-hub";
import Hub from "../entity";
import City from "../../city/entity";
import reassignHubHotels, { IHotelHubs } from "./reassign-hotels-hub";
import deleteHub from "./delete-hub";
import changeStatusHub from "./update-status";
import Hotel from "../../hotel/entity";

export interface HubUsecase {
  listHubs(req: IHubFilter): Promise<[Hub[], number]>;
  createHub(data: ICreateHubInput): Promise<ICreateHubOutput>;
  updateHub(id: number, data: IUpdateHubInput): Promise<IUpdateHubOutput>;
  getHub(id: number): Promise<Hub>;
  deleteHub(id: number): Promise<boolean>;
  changeStatusHub(id: number, status: boolean): Promise<Hub>;
  reassignHubHotels(hotelHubs: IHotelHubs[], deactivateHubId: number): Promise<Hub>;
}

export default (dependency: IDefaultUsecaseDependency): HubUsecase => {
  const { conn } = dependency;
  return {
    listHubs: getList({
      hubRepository: conn.em.getRepository(Hub)
    }),
    createHub: createHub({
      hubRepository: conn.em.getRepository(Hub),
      cityRepository: conn.em.getRepository(City)
    }),
    updateHub: updateHub({
      hubRepository: conn.em.getRepository(Hub),
      cityRepository: conn.em.getRepository(City)
    }),
    getHub: getHub({
      hubRepository: conn.em.getRepository(Hub)
    }),
    deleteHub: deleteHub({
      hubRepository: conn.em.getRepository(Hub)
    }),
    changeStatusHub: changeStatusHub({
      hubRepository: conn.em.getRepository(Hub)
    }),
    reassignHubHotels: reassignHubHotels({
      hubRepository: conn.em.getRepository(Hub),
      hotelRepository: conn.em.getRepository(Hotel)
    })
  };
};
