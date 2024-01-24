import { BaseEntity } from "@butlerhospitality/service-sdk";
import {
  Entity, Property, Unique, JsonType
} from "@mikro-orm/core";
import { UserRepository } from "./repository";

@Entity({ tableName: "iam_user", customRepository: () => UserRepository })
export default class User extends BaseEntity {
  @Property({ primary: true })
  id!: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true })
  @Unique()
  email?: string;

  @Property({ length: 255 })
  status?: string;

  @Property({ nullable: true, default: "[]" })
  roles?: JsonType;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ nullable: true })
  phone_number?: string;
}
