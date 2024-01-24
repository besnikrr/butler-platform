import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import City from "../entity";
import { CityRepository } from "../repository";
import getList, { ICityFilter } from "./list-cities";
import getSingle from "./get-city";
import createCity, { ICreateCityOutput, ICreateCityInput } from "./create-city";
import updateCity, { IUpdateCityInput, IUpdateCityOutput } from "./update-city";
import deleteCity from "./delete-city";

export interface CityUsecases {
  getList(filterParams: ICityFilter): Promise<[City[], number]>;
  getCity(id: number): Promise<City>;
  createCity(data: ICreateCityInput): Promise<ICreateCityOutput>;
  updateCity(id: number, data: IUpdateCityInput): Promise<IUpdateCityOutput>;
  deleteCity(id: number): Promise<boolean>;
}

export default (dependency: IDefaultUsecaseDependency): CityUsecases => {
  const { conn } = dependency;
  const cityRepository = conn.em.getRepository(City) as CityRepository;
  return {
    getList: getList({ cityRepository }),
    getCity: getSingle({ cityRepository }),
    createCity: createCity({ cityRepository }),
    updateCity: updateCity({ cityRepository }),
    deleteCity: deleteCity({ cityRepository })
  };
};
