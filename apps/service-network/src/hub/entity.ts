
import {
  Entity, Property, ManyToOne, Unique, OneToMany, Collection
} from "@mikro-orm/core";
import { BaseEntity, IPublishableEntity, NumericType } from "@butlerhospitality/service-sdk";

import City from "../city/entity";
import Hotel from "../hotel/entity";
import { HubRepository } from "./repository";

export interface IHub {
  id?: number;
  oms_id?: number;
  city: City;
  name: string;
  active: boolean;
  tax_rate?: number;
  contact_phone?: string;
  contact_email?: string;
  address_street?: string;
  address_number?: string;
  address_town?: string;
  address_zip_code?: string;
  address_coordinates?: string;
  has_nextmv_enabled: boolean;
  has_expeditor_app_enabled: boolean;
  hotels: Collection<Hotel>;
}

export interface IHubPublish extends IPublishableEntity { }

@Entity({
  customRepository: () => HubRepository
})
export default class Hub extends BaseEntity implements IHub {
  @Property({ nullable: true })
  @Unique()
  oms_id?: number;

  @ManyToOne({ entity: () => City })
  city!: City;

  @Property({ length: 255 })
  name!: string;

  @Property({ default: false })
  active: boolean = false;

  @Property({
    nullable: true,
    type: NumericType
  })
  tax_rate?: number;

  @Property({ length: 255, nullable: true })
  contact_phone?: string;

  @Property({ length: 255, nullable: true })
  contact_email?: string;

  @Property({ length: 255, nullable: true })
  address_street?: string;

  @Property({ length: 255, nullable: true })
  address_number?: string;

  @Property({ length: 255, nullable: true })
  address_town?: string;

  @Property({ length: 255, nullable: true })
  address_zip_code?: string;

  @Property({ length: 255, nullable: true })
  address_coordinates?: string;

  @Property({ length: 50 })
  color!: string;

  @Property({ default: false })
  has_nextmv_enabled: boolean = false;

  @Property({ default: false })
  has_expeditor_app_enabled: boolean = false;

  @OneToMany({ entity: () => Hotel, mappedBy: "hub", orphanRemoval: true })
  hotels = new Collection<Hotel>(this);
}
