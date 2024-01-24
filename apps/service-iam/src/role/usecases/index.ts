import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listRoles from "./list-roles";
import getRole from "./get-role";
import createRole, { IRoleCreateInput } from "./create-role";
import updateRole, { IUpdateRoleInput } from "./update-role";
import deleteRole from "./delete-role";
import Role from "../entities/role";
import { BaseFilter } from "@butlerhospitality/service-sdk";

export interface RoleUsecase {
  listRoles(req: BaseFilter): Promise<[Role[], number]>;
  getRole(id: number): Promise<Role>;
  createRole(data: IRoleCreateInput): Promise<Role>;
  updateRole(id: number, data: IUpdateRoleInput): Promise<Role>;
  deleteRole(id: number): Promise<Role>;
}

export default (dependency: IDefaultUsecaseDependency): RoleUsecase => {
  const { conn } = dependency;
  return {
    listRoles: listRoles({
      roleRepository: conn.em.getRepository(Role)
    }),
    getRole: getRole({
      roleRepository: conn.em.getRepository(Role)
    }),
    createRole: createRole({
      roleRepository: conn.em.getRepository(Role)
    }),
    updateRole: updateRole({
      roleRepository: conn.em.getRepository(Role)
    }),
    deleteRole: deleteRole({
      roleRepository: conn.em.getRepository(Role)
    })
  };
};
