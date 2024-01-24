import Role from "../entities/role";
import { IRoleRepository } from "../repository";

export interface IGetRoleDependency {
  roleRepository: IRoleRepository;
}

export default (dependency: IGetRoleDependency) => {
  const { roleRepository } = dependency;
  return async (id: number): Promise<Role> => {
    return roleRepository.getOneEntityOrFail(id, ["permissiongroups"]);
  };
};
