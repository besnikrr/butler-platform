
import { BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import {
  Entity, ManyToOne, Property, BeforeCreate, Unique, BigIntType
} from "@mikro-orm/core";
import Hub from "../../hub/entities/hub";
import { OutOfStockRepository } from "../repository";
import Product from "./product";

export interface IOutOfStockPublish extends IPublishableEntity {
  id: number;
}

@Entity({ customRepository: () => OutOfStockRepository })
export default class OutOfStock extends BaseEntity {
  @Unique()
  @Property({ columnType: "bigint", type: BigIntType, nullable: true })
  oms_id?: number;

  @Property()
  product_id: number;

  @Property()
  hub_id: number;

  @Property()
  available_at!: Date;

  @ManyToOne({
    entity: () => Hub,
    joinColumn: "hub_id",
    inversedBy: "out_of_stock"
  })
  hub: Hub;

  @ManyToOne({
    entity: () => Product,
    joinColumn: "product_id",
    inversedBy: "out_of_stock"
  })
  product: Product;

  @BeforeCreate()
  async parseDateToUTC() {
    this.available_at = new Date(this.available_at.toISOString());
  }
}
