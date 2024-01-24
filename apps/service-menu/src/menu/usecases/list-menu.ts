import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FindOptions, QueryOrder, FilterQuery } from "@mikro-orm/core";
import Menu from "../entities/menu";
import { IMenuRepository } from "../repository";

export interface MenuFilter extends BaseFilter {
  name?: string;
  hotelIds?: number[];
}

export interface IListMenuDependency {
  menuRepository: IMenuRepository;
}

export default (dependency: IListMenuDependency) => {
  const { menuRepository } = dependency;
  return async (filterOptions: MenuFilter): Promise<[Menu[], number]> => {
    const name = filterOptions?.name?.trim();

    const filterQuery: FilterQuery<Menu> = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      }),
      ...(filterOptions.hotelIds &&
        filterOptions.hotelIds.length > 0 && {
        hotels: filterOptions.hotelIds
      })
    };

    const options: FindOptions<Menu> = {
      ...(filterOptions?.page && { offset: (filterOptions.page - 1) * filterOptions.limit }),
      ...(filterOptions?.limit && { limit: filterOptions.limit }),
      populate: ["hotels"],
      orderBy: {
        name: QueryOrder.ASC
      }
    };

    return menuRepository.findAndCount(filterQuery, options);
  };
};
