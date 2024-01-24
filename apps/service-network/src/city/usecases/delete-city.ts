import { ConflictError, eventProvider } from "@butlerhospitality/service-sdk";
import { CITY_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { ICityRepository } from "../repository";

export interface IDeleteCityDependency {
  cityRepository: ICityRepository;
}

export default (dependency: IDeleteCityDependency) => {
  const { cityRepository } = dependency;
  return async (id: number): Promise<boolean> => {
    const city = await cityRepository.getOneEntityOrFail({ id }, ["hubs"]);

    if (city.hubs?.count()) {
      throw new ConflictError("City has hub relations");
    }

    const result = cityRepository.softDelete(id);

    const payload = {
      entity: ENTITY.NETWORK.CITY,
      id: city.id
    };

    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.NETWORK.CITY, CITY_EVENT.DELETED, null, payload
    );
    return result;
  };
};
