import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery, FindOptions, QueryOrder } from "@mikro-orm/core";
import City from "../entity";
import { ICityRepository } from "../repository";

export interface ICityFilter extends BaseFilter {
  name?: string;
}

export interface IGetListCityDependency {
  cityRepository: ICityRepository;
}

export default (dependency: IGetListCityDependency) => {
  const { cityRepository } = dependency;
  return async (filters: ICityFilter) => {
    const name = filters?.name?.trim();
    const whereFilters: FilterQuery<City> = {
      deleted_at: null,
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      })
    };

    const options: FindOptions<City> = {
      ...(filters?.page && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit }),
      populate: ["hubs.hotels"],
      orderBy: { created_at: QueryOrder.DESC }
    };

    return cityRepository.findAndCount(whereFilters, options);
  };
};
