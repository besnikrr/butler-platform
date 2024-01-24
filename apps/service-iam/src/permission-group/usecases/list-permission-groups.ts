import { BaseFilter } from "@butlerhospitality/service-sdk";
import PermissionGroup from "../entities/permission-group";
import { IPermissionGroupRepository } from "../repository";

export interface IListPermissionGroupsDependency {
  permissionGroupRepository: IPermissionGroupRepository;
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
        }
      ]
    })
  };
};

export default (dependency: IListPermissionGroupsDependency) => {
  const { permissionGroupRepository } = dependency;
  return async (filters: BaseFilter): Promise<[PermissionGroup[], number]> => {
    const whereFilters = parseFilters(filters);
    const options = {
      ...{ populate: ["permissions"] },
      ...(filters?.page && filters?.limit && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit })
    };
    return permissionGroupRepository.findAndCount(whereFilters, options);
  };
};
