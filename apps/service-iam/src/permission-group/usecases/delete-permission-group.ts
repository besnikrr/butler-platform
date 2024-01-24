import PermissionGroup from "../entities/permission-group";
import { IPermissionGroupRepository } from "../repository";

export interface IDeletePermissionGroupDependency {
  permissionGroupRepository: IPermissionGroupRepository;
}

export default (dependency: IDeletePermissionGroupDependency) => {
  const { permissionGroupRepository } = dependency;
  return async (id: number): Promise<PermissionGroup> => {
    const group = await permissionGroupRepository.getOneEntityOrFail(id, ["permissions"]);
    group.permissions.removeAll();
    await permissionGroupRepository.softDelete(id);
    return group;
  };
};
