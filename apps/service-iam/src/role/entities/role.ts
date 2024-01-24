
import {
  Entity, Property, Collection, ManyToMany
} from "@mikro-orm/core";

import { BaseEntity } from "@butlerhospitality/service-sdk";
import User from "../../user/entities/user";
import { RoleRepository } from "../repository";
import PermissionGroup from "../../permission-group/entities/permission-group";

@Entity({
  tableName: "role",
  customRepository: () => RoleRepository
})
export default class Role extends BaseEntity {
  @Property()
  name: string;

  @Property()
  description: string;

  @ManyToMany({
    entity: () => PermissionGroup,
    owner: true,
    pivotTable: "role_permissiongroup",
    joinColumn: "role_id",
    inverseJoinColumn: "permissiongroup_id",
    referenceColumnName: "id"
  })
  permissiongroups = new Collection<PermissionGroup>(this);

  @ManyToMany({
    entity: () => User,
    mappedBy: (user) => user.roles
  })
  users = new Collection<User>(this);
}
