
import { BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  Collection, Entity, Filter, OneToMany, Property
} from "@mikro-orm/core";
import { CityRepository } from "./repository";

import Hub from "../hub/entity";

export interface ICity {
  id?: number;
  oms_id?: number;
  name: string;
  time_zone: string;
  state?: string;
  hubs?: Collection<Hub>;
  voice_url?: string;
}

export interface ICityPublish extends ICity, IPublishableEntity {}

@Entity({
  customRepository: () => CityRepository
})
@Filter({ name: "name", cond: (args) => ({ name: { $eq: args.name } }) })
export default class City extends BaseEntity implements ICity {
  @Property({
    columnType: "bigint",
    nullable: true
  })
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ length: 255 })
  time_zone!: string;

  @Property({ length: 255, nullable: true })
  state?: string;

  @OneToMany({ entity: () => Hub, mappedBy: "city" })
  hubs? = new Collection<Hub>(this);

  @Property({ length: 255, nullable: true })
  voice_url?: string;
}
