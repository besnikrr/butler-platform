import { ICityRepository } from "../repository";

export interface IGetCityDependency {
  cityRepository: ICityRepository;
}

export default (dependency: IGetCityDependency) => {
  const { cityRepository } = dependency;
  return async (id: number) => {
    return cityRepository.getOneEntityOrFail(id);
  };
};
