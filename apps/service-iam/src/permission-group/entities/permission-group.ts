
import {
  Entity, Property, Collection, ManyToMany
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import Role from "../../role/entities/role";
import Permission from "./permission";
import { PermissionGroupRepository } from "../repository";

@Entity({ tableName: "permissiongroup", customRepository: () => PermissionGroupRepository })
export default class PermissionGroup extends BaseEntity {
  @Property()
  name: string;

  @ManyToMany({
    entity: () => Permission,
    owner: true,
    pivotTable: "permissiongroup_permission",
    joinColumn: "permissiongroup_id",
    inverseJoinColumn: "permission_id",
    referenceColumnName: "id"
  })
  permissions = new Collection<Permission>(this);

  @ManyToMany({
    entity: () => Role,
    mappedBy: (role) => role.permissiongroups
  })
  roles = new Collection<Role>(this);
}
