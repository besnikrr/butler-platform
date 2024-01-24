import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery, FindOptions, QueryOrder } from "@mikro-orm/core";
import Hub from "../entities/hub";
import { IHubRepository } from "../repository";

export interface HubFilter extends BaseFilter {
  name?: string
}

export interface IListHubDependency {
  hubRepository: IHubRepository;
}

export default (dep: IListHubDependency) => {
  return async (filterOptions: HubFilter): Promise<[Hub[], number]> => {
    const name = filterOptions?.name?.trim();
    const filterQuery: FilterQuery<Hub> = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      })
    };

    const options: FindOptions<Hub> = {
      offset: (filterOptions.page - 1) * filterOptions.limit,
      limit: filterOptions.limit,
      populate: ["hotels"],
      orderBy: {
        name: QueryOrder.ASC
      }
    };

    return dep.hubRepository.findAndCount(filterQuery, options);
  };
};
