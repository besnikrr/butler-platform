import { IHotelRepository } from "@services/service-network/src/hotel/repository";

export interface IGetHotelDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IGetHotelDependency) => {
  return async (id: number) => {
    return await dependency.hotelRepository.findOne(id, ["hub"]);
  };
};
