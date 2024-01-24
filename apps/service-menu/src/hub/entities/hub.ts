import { BaseEntity } from "@butlerhospitality/service-sdk";
import {
  Collection, Entity, OneToMany, Property, Unique
} from "@mikro-orm/core";
import Hotel from "../../hotel/entities/hotel";
import OutOfStock from "../../product/entities/out-of-stock";
import { HubRepository } from "../repository";

@Entity({
  customRepository: () => HubRepository
})
export default class Hub extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

  @OneToMany({
    entity: () => Hotel,
    mappedBy: "hub"
  })
  hotels = new Collection<Hotel>(this);

  @OneToMany({
    entity: () => OutOfStock,
    mappedBy: "hub"
  })
  out_of_stock: OutOfStock[];

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;
}
