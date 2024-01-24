import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";
import PermissionGroup from "../entities/permission-group";
import { IPermissionGroupRepository } from "../repository";

export interface IPermissionGroupCreateInput {
  name: string;
  permissions: number[];
}

export class CreatePermissionGroupInput implements IPermissionGroupCreateInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true, message: "Permissions must be a number array" })
  permissions: number[];
}

export interface ICreatePermissionGroupDependency {
  permissionGroupRepository: IPermissionGroupRepository;
}

export default (dependency: ICreatePermissionGroupDependency) => {
  const { permissionGroupRepository } = dependency;
  return async (groupInput: IPermissionGroupCreateInput): Promise<PermissionGroup> => {
    const groupToInsert = permissionGroupRepository.create(groupInput);
    permissionGroupRepository.assign(groupToInsert, groupInput);
    await permissionGroupRepository.persistAndFlush(groupToInsert);
    return permissionGroupRepository.populate(groupToInsert, ["permissions"]);
  };
};
