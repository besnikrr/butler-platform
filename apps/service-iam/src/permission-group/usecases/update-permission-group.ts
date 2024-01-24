import { IsString, IsOptional, MaxLength } from "class-validator";
import PermissionGroup from "../entities/permission-group";
import { IPermissionGroupRepository } from "../repository";

export interface IUpdatePermissionGroupInput {
  name?: string;
  permissions?: number[];
}

export class UpdatePermissionGroupInput implements IUpdatePermissionGroupInput {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name: string;

  @IsOptional()
  permissions: number[];
}

export interface IUpdatePermissionGroupInputsDependency {
  permissionGroupRepository: IPermissionGroupRepository;
}

export default (dependency: IUpdatePermissionGroupInputsDependency) => {
  const { permissionGroupRepository } = dependency;
  return async (id: number, data: IUpdatePermissionGroupInput): Promise<PermissionGroup> => {
    const group = await permissionGroupRepository.getOneEntityOrFail({ id }, ["permissions"]);
    group.permissions.removeAll();
    permissionGroupRepository.assign(group, { ...data, mergeObjects: true });
    await permissionGroupRepository.persistAndFlush(group);
    return group;
  };
};
