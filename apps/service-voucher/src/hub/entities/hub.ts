
import {
  Collection, Entity, OneToMany, Property, Unique
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import { HubRepository } from "../repository";
import Hotel from "../../hotel/entities/hotel";

@Entity({ tableName: "hub", customRepository: () => HubRepository })
export default class Hub extends BaseEntity {
  @Property({ primary: true })
  id: number;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @Property({ default: true })
  active: boolean = true;

  @OneToMany({
    entity: () => Hotel,
    mappedBy: (hotel) => hotel.hub
  })
  hotels = new Collection<Hotel>(this);
}
