
import { BaseEntity, IBaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  Collection, Entity, ManyToMany, Property, Unique
} from "@mikro-orm/core";
import Product from "../../product/entities/product";
import { LabelRepository } from "../repository";

export interface ILabelPublish extends IPublishableEntity { }

export interface ILabel extends IBaseEntity {
  name: string,
  products?: Collection<Product>
}

@Entity({ customRepository: () => LabelRepository })
export default class Label extends BaseEntity implements ILabel {
  @Property({ length: 255 })
  name!: string;

  @ManyToMany({
    entity: () => Product,
    mappedBy: (product) => product.labels
  })
  products = new Collection<Product>(this);

  @Property({ nullable: true })
  @Unique()
  oms_id?: number;
}
