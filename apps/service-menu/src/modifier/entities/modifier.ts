
import { BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  BigIntType,
  Collection, Entity, ManyToMany, OneToMany, Property, Unique
} from "@mikro-orm/core";
import Product from "../../product/entities/product";
import { ModifierRepository } from "../repository";
import ModifierOption from "./modifier-option";

export interface IModifierPublish extends IPublishableEntity { }

@Entity({ customRepository: () => ModifierRepository })
export default class Modifier extends BaseEntity {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  oms_id?: number;

  @Property({ length: 255 })
  name!: string;

  @Property({
    default: false
  })
  multiselect!: boolean;

  @OneToMany({
    entity: () => ModifierOption,
    mappedBy: "modifier",
    eager: true,
    orphanRemoval: true
  })
  options = new Collection<ModifierOption>(this);

  @ManyToMany({
    entity: () => Product,
    mappedBy: (product) => product.modifiers
  })
  products = new Collection<Product>(this);
}
