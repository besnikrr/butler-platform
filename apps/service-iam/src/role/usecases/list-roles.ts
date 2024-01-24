import { BaseFilter } from "@butlerhospitality/service-sdk";
import Role from "../entities/role";
import { IRoleRepository } from "../repository";

export interface IListRolesDependency {
  roleRepository: IRoleRepository;
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

export default (dependency: IListRolesDependency) => {
  const { roleRepository } = dependency;
  return async (filters: BaseFilter): Promise<[Role[], number]> => {
    const whereFilters = parseFilters(filters);
    const options = {
      ...{ populate: ["permissiongroups"] },
      ...(filters?.page && filters?.limit && { offset: (filters.page - 1) * filters.limit }),
      ...(filters?.limit && { limit: filters.limit })
    };
    return roleRepository.findAndCount(whereFilters, options);
  };
};
