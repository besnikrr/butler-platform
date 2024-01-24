import { IsString, IsOptional, MaxLength } from "class-validator";
import Role from "../entities/role";
import { IRoleRepository } from "../repository";

export interface IUpdateRoleInput {
  name?: string;
  description?: string;
  permissiongroups?: number[];
}

export class UpdateRoleInput implements IUpdateRoleInput {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description: string;

  @IsOptional()
  permissiongroups: number[];
}

export interface IUpdateRoleDependency {
  roleRepository: IRoleRepository;
}

export default (dependency: IUpdateRoleDependency) => {
  const { roleRepository } = dependency;
  return async (id: number, data: IUpdateRoleInput): Promise<Role> => {
    await roleRepository.failIfEntityExists({ name: { $eq: data.name } });
    const role = await roleRepository.getOneEntityOrFail({ id }, ["permissiongroups"]);
    role.permissiongroups.removeAll();
    roleRepository.assign(role, { ...data, mergeObjects: true });
    await roleRepository.persistAndFlush(role);
    return role;
  };
};
