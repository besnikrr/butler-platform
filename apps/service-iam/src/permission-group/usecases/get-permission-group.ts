import PermissionGroup from "../entities/permission-group";
import { IPermissionGroupRepository } from "../repository";

export interface IGetPermissionGroupDependency {
  permissionGroupRepository: IPermissionGroupRepository;
}

export default (dependency: IGetPermissionGroupDependency) => {
  const { permissionGroupRepository } = dependency;
  return async (id: number): Promise<PermissionGroup> => {
    return permissionGroupRepository.getOneEntityOrFail(id, ["permissions"]);
  };
};
