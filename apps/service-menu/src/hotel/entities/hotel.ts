
import {
  Collection, Entity, ManyToMany, ManyToOne, Property, Unique
} from "@mikro-orm/core";
import { BaseEntity } from "@butlerhospitality/service-sdk";
import Hub from "../../hub/entities/hub";
import Menu from "../../menu/entities/menu";
import { HotelRepository } from "../repository";

@Entity({ customRepository: () => HotelRepository })
export default class Hotel extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @ManyToOne({ entity: () => Hub })
  hub!: Hub;

  @ManyToMany({
    entity: () => Menu,
    mappedBy: (menu) => menu.hotels
  })
  menus = new Collection<Menu>(this);

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;
}
