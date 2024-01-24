
import { Collection, Entity, ManyToMany, Property, Unique } from "@mikro-orm/core";
import { BaseEntity, IBaseEntity } from "@butlerhospitality/service-sdk";
import { HubRepository } from "../repository";
import User from "../../user/entities/user";

export interface IHub extends IBaseEntity {
  name: string;
  oms_id?: number;
  active: boolean;
}

@Entity({ tableName: "hub", customRepository: () => HubRepository })
export default class Hub extends BaseEntity implements IHub {
  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ default: true })
  active: boolean = true;

  @ManyToMany({
    entity: () => User,
    pivotTable: "iam_user_hub",
    joinColumn: "hub_id",
    inverseJoinColumn: "user_id",
    referenceColumnName: "id"
  })
  users = new Collection<User>(this);
}
