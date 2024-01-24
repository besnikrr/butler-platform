/* eslint-disable max-len */

import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Permission from "./entities/permission";
import PermissionGroup from "./entities/permission-group";

export interface IPermissionRepository extends CustomEntityRepository<Permission> {}
export class PermissionRepository extends CustomEntityRepository<Permission> implements IPermissionRepository {}

export interface IPermissionGroupRepository extends CustomEntityRepository<PermissionGroup> {}
export class PermissionGroupRepository extends CustomEntityRepository<PermissionGroup> implements IPermissionGroupRepository {}
