import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery } from "@mikro-orm/core";
import Hotel from "../entities/hotel";
import { IHotelRepository } from "../repository";

export interface IHotelFilter extends BaseFilter {
  name?: string;
}
export interface IGetHotelListDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IGetHotelListDependency) => {
  const { hotelRepository } = dependency;
  return async (filters: IHotelFilter) => {
    const name = filters?.name?.trim();
    const whereFilters: FilterQuery<Hotel> = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      })

    };

    return hotelRepository.findAndCount(whereFilters);
  };
};
