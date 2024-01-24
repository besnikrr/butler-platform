import Role from "../entities/role";
import { IRoleRepository } from "../repository";

export interface IDeleteRoleDependency {
  roleRepository: IRoleRepository;
}

export default (dependency: IDeleteRoleDependency) => {
  const { roleRepository } = dependency;
  return async (id: number): Promise<Role> => {
    const role = await roleRepository.getOneEntityOrFail(id, ["permissiongroups"]);
    role.permissiongroups.removeAll();
    await roleRepository.softDelete(id);
    return role;
  };
};
