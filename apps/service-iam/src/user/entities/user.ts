
import {
  Entity, Property, Collection, ManyToMany, Unique
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import Role from "../../role/entities/role";
import { UserRepository } from "../repository";
import Hub from "../../hub/entities/hub";

@Entity({
  tableName: "iam_user",
  customRepository: () => UserRepository
})
export default class User extends BaseEntity {
  @Property()
  name: string;

  @Property()
  email: string;

  @Property()
  phone_number?: string;

  @ManyToMany({
    entity: () => Role,
    owner: true,
    pivotTable: "user_role",
    joinColumn: "user_id",
    inverseJoinColumn: "role_id",
    referenceColumnName: "id"
  })
  roles = new Collection<Role>(this);

  @ManyToMany({
    entity: () => Hub,
    owner: true,
    pivotTable: "iam_user_hub",
    joinColumn: "user_id",
    inverseJoinColumn: "hub_id",
    referenceColumnName: "id"
  })
  hubs = new Collection<Hub>(this);

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;
}
