import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery, FindOptions, QueryOrder } from "@mikro-orm/core";
import Hotel from "../entities/hotel";
import { IHotelRepository } from "../repository";

export interface HotelFilter extends BaseFilter {
  name?: string;
  menuIds?: number[];
}

export interface IListHotelsDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IListHotelsDependency) => {
  const { hotelRepository } = dependency;
  return async (filterOptions: HotelFilter) => {
    const name = filterOptions?.name?.trim();
    const filterQuery: FilterQuery<Hotel> = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      }),
      ...(filterOptions.menuIds &&
        filterOptions.menuIds.length > 0 && {
        menus: filterOptions.menuIds
      })
    };

    const options: FindOptions<Hotel> = {
      offset: filterOptions.paginate && (filterOptions.page - 1) * filterOptions.limit,
      limit: filterOptions.paginate && filterOptions.limit,
      populate: ["hub", "menus"],
      orderBy: {
        name: QueryOrder.ASC
      }
    };

    return hotelRepository.findAndCount(filterQuery, options);
  };
};
