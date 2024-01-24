
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Role from "./entities/role";

export interface IRoleRepository extends CustomEntityRepository<Role> {}
export class RoleRepository extends CustomEntityRepository<Role> implements IRoleRepository {}
