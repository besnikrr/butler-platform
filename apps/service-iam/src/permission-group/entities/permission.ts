
import {
  Entity, Property, Collection, ManyToMany, Filter, OneToOne
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import App from "../../app/entities/app";
import PermissionGroup from "./permission-group";
import { PermissionRepository } from "../repository";

@Entity({ tableName: "permission", customRepository: () => PermissionRepository })
@Filter({ name: "removeDeleted", cond: { deleted_at: null } })
export default class Permission extends BaseEntity {
  @Property()
  name: string;

  @Property()
  arn: string;

  @Property({
    type: "number"
  })
  app_id: number;

  @ManyToMany({
    entity: () => PermissionGroup,
    mappedBy: (permissiongroup) => permissiongroup.permissions
  })
  permissiongroups = new Collection<PermissionGroup>(this);

  @OneToOne({
    entity: () => App,
    inversedBy: (app) => app.permission
  })
  app: App;

  constructor(name: string, arn: string) {
    super();
    this.name = name;
    this.arn = arn;
  }
}
