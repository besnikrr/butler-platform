import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import City from "../entity";

export default (cityRepository: CustomEntityRepository<City>) => {
  return async (id: number) => {
    return cityRepository.getOneEntityOrFail({ id }, ["hubs.hotels"]);
  };
};
