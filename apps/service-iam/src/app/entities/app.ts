
import { PureBaseEntity } from "@butlerhospitality/service-sdk";
import {
  Entity, Property, OneToOne, JsonType
} from "@mikro-orm/core";
import Permission from "../../permission-group/entities/permission";
import { AppRepository } from "../repository";

@Entity({ tableName: "app", customRepository: () => AppRepository })
export default class App extends PureBaseEntity {
  @Property()
  name: string;

  @Property()
  description: string;

  @Property({
    type: JsonType,
    nullable: true
  })
  dashboard_settings: {
    icon: string;
    path: string;
    color: string;
    iconColor?: string;
    title: string;
    group?: string;
  };

  @OneToOne({
    entity: () => Permission,
    mappedBy: (permission) => permission.app
  })
  permission: Permission;
}
