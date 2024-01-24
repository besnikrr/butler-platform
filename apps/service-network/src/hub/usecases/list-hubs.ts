import { FindOptions, QueryOrder } from "@mikro-orm/core";
import { BaseFilter } from "@butlerhospitality/service-sdk";
import Hub from "../entity";
import { IHubRepository } from "../repository";

export interface IHubFilter extends BaseFilter {
  name?: string;
  city_ids?: string[];
  statuses?: string[];
}

export interface IGetListHubDependency {
  hubRepository: IHubRepository;
}

const parseFilters = (filters: IHubFilter) => {
  const name = filters?.name?.trim();
  return {
    deleted_at: null,
    ...(name && {
      $or: [
        {
          name: {
            $ilike: `%${name}%`
          }
        },
        {
          contact_email: {
            $ilike: `%${name}%`
          }
        },
        {
          contact_phone: {
            $ilike: `%${name}%`
          }
        }
      ]
    }),
    ...(filters.city_ids && {
      city_id: {
        $in: filters.city_ids
      }
    }),
    ...(filters.statuses && { active: filters.statuses })
  };
};

export default (dependency: IGetListHubDependency) => {
  const { hubRepository } = dependency;
  return async (filters: IHubFilter) => {
    const whereFilters = parseFilters(filters);
    const options: FindOptions<Hub> = {
      ...(filters?.page && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit }),
      populate: ["city", "hotels"],
      orderBy: { created_at: QueryOrder.DESC }
    };
    return hubRepository.findAndCount(whereFilters, options);
  };
};
