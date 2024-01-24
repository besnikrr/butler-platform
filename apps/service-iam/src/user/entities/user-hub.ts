
import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity, IBaseEntity } from "@butlerhospitality/service-sdk";
import { UserHubRepository } from "../repository";

export interface IUserHub extends IBaseEntity {
  user_id: number;
  hub_id: number;
  is_active: boolean;
  is_default: boolean;
}

@Entity({
  tableName: "iam_user_hub",
  customRepository: () => UserHubRepository
})
export default class UserHub extends BaseEntity implements IUserHub {
  @Property()
  user_id: number;

  @Property()
  hub_id: number;

  @Property()
  is_active: boolean = false;

  @Property()
  is_default: boolean = false;
}
