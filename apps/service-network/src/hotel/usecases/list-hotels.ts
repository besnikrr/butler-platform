import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FindOptions, QueryOrder } from "@mikro-orm/core";
import Hotel from "../entity";
import { IHotelRepository } from "../repository";

export interface HotelFilter extends BaseFilter {
  account_manager?: number
  name?: string;
  hub_ids?: string[];
  statuses?: string[];
  web_code?: string;
}

const parseFilters = (filters: HotelFilter) => {
  const name = filters?.name?.trim();
  const web_code = filters?.web_code?.trim();
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
            $ilike: `${name}%`
          }
        },
        {
          web_phone: {
            $ilike: `${name}%`
          }
        },
        {
          code: {
            $ilike: `${name}%`
          }
        }
      ]
    }),
    ...(filters.hub_ids && {
      hub_id: {
        $in: filters.hub_ids
      }
    }),
    ...(filters.statuses && { active: filters.statuses }),
    ...(filters.account_manager && { account_manager_id: filters.account_manager }),
    ...(web_code && { web_code: { $eq: web_code } })
  };
};

export interface IListHotelsDependency {
  hotelRepository: IHotelRepository;
}

export default (dependency: IListHotelsDependency) => {
  const { hotelRepository } = dependency;
  return async (filters: HotelFilter) => {
    const whereFilters = parseFilters(filters);
    const options: FindOptions<Hotel> = {
      ...(filters?.page && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit }),
      populate: ["hub.city"],
      orderBy: { created_at: QueryOrder.DESC }
    };
    return hotelRepository.findAndCount(whereFilters, options);
  };
};
