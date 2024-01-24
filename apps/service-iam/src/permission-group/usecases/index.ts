import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listPermissionGroups from "./list-permission-groups";
import getPermissionGroup from "./get-permission-group";
import createPermissionGroup, { IPermissionGroupCreateInput } from "./create-permission-group";
import updatePermissionGroup, { IUpdatePermissionGroupInput } from "./update-permission-group";
import deletePermissionGroup from "./delete-permission-group";
import PermissionGroup from "../entities/permission-group";
import { BaseFilter } from "@butlerhospitality/service-sdk";

export interface PermissionGroupUsecase {
  listPermissionGroups(req: BaseFilter): Promise<[PermissionGroup[], number]>;
  getPermissionGroup(id: number): Promise<PermissionGroup>;
  createPermissionGroup(data: IPermissionGroupCreateInput): Promise<PermissionGroup>;
  updatePermissionGroup(id: number, data: IUpdatePermissionGroupInput);
  deletePermissionGroup(id: number): Promise<PermissionGroup>;
}

export default (dependency: IDefaultUsecaseDependency): PermissionGroupUsecase => {
  const { conn } = dependency;
  return {
    listPermissionGroups: listPermissionGroups({
      permissionGroupRepository: conn.em.getRepository(PermissionGroup)
    }),
    getPermissionGroup: getPermissionGroup({
      permissionGroupRepository: conn.em.getRepository(PermissionGroup)
    }),
    createPermissionGroup: createPermissionGroup({
      permissionGroupRepository: conn.em.getRepository(PermissionGroup)
    }),
    updatePermissionGroup: updatePermissionGroup({
      permissionGroupRepository: conn.em.getRepository(PermissionGroup)
    }),
    deletePermissionGroup: deletePermissionGroup({
      permissionGroupRepository: conn.em.getRepository(PermissionGroup)
    })
  };
};
