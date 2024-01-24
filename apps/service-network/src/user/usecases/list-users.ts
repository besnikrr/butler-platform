import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery } from "@mikro-orm/core";
import User from "../entity";
import { IUserRepository } from "../repository";

export interface UserFilter extends BaseFilter {
  id?: number;
  name?: string;
}

export interface IListUsersDependency {
  userRepository: IUserRepository;
}

export default (dependency: IListUsersDependency) => {
  const { userRepository } = dependency;
  return async (filters: UserFilter) => {
    const name = filters?.name?.trim();
    const whereFilters: FilterQuery<User> = {
      $or: [
        { ...(filters.id && {
          id: {
            $eq: filters.id
          }
        })
        },
        { ...(name && {
          name: {
            $ilike: `%${name}%`
          }
        })
        }
      ]
    };

    return userRepository.findAndCount(whereFilters);
  };
};
