import {
  IsNotEmpty, IsString, IsOptional, IsNumber, MaxLength
} from "class-validator";
import Role from "../entities/role";
import { IRoleRepository } from "../repository";

export interface IRoleCreateInput {
  name: string;
  description: string;
  permissiongroups: number[];
}

export class CreateRoleInput implements IRoleCreateInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true, message: "Permission groups must be a number array" })
  permissiongroups: number[];
}

export interface ICreateRoleDependency {
  roleRepository: IRoleRepository;
}

export default (dependency: ICreateRoleDependency) => {
  const { roleRepository } = dependency;
  return async (roleInput: IRoleCreateInput): Promise<Role> => {
    await roleRepository.failIfEntityExists({ name: { $eq: roleInput.name } });

    const roleToInsert = roleRepository.create(roleInput);

    roleRepository.assign(roleToInsert, roleInput);

    await roleRepository.persistAndFlush(roleToInsert);
    return roleRepository.populate(roleToInsert, ["permissiongroups"]);
  };
};
