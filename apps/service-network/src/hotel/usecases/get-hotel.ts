
import { IHotelRepository } from "../repository";

export interface IGetHotelDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IGetHotelDependency) => {
  const { hotelRepository } = dependency;
  return async (id: number) => {
    return await hotelRepository.getOneEntityOrFail({ id }, ["hub.city", "account_manager"]);
  };
};
