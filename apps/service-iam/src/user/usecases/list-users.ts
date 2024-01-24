import { BaseFilter } from "@butlerhospitality/service-sdk";
import User from "../entities/user";
import { IUserRepository } from "../repository";

export interface IListUsersDependency {
  userRepository: IUserRepository;
}

const parseFilters = (filters: BaseFilter) => {
  const search = filters?.search?.trim();
  return {
    ...(search && {
      $or: [
        {
          name: {
            $ilike: `%${search}%`
          }
        },
        {
          email: {
            $ilike: `%${search}%`
          }
        }
      ]
    })
  };
};

export default (dependency: IListUsersDependency) => {
  const { userRepository } = dependency;
  return async (filters: BaseFilter): Promise<[User[], number]> => {
    const whereFilters = parseFilters(filters);
    const options = {
      ...{ populate: ["roles"] },
      ...(filters?.page && filters?.limit && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit })
    };
    return userRepository.findAndCount(whereFilters, options);
  };
};
