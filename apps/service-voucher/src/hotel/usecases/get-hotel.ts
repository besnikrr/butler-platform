import Hotel from "../entities/hotel";
import { IHotelRepository } from "../repository";

export interface IGetHotelDependency {
  hotelRepository: IHotelRepository;
}
export default (dependency: IGetHotelDependency) => {
  const { hotelRepository } = dependency;
  return async (id: number): Promise<Hotel> => {
    return hotelRepository.getOneEntityOrFail(id, ["hub"]);
  };
};
