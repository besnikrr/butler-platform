import { BaseEntity, CustomEntityRepository } from "@butlerhospitality/service-sdk";
import {
  Entity, JsonType, ManyToOne, Property
} from "@mikro-orm/core";
import { Order } from "./order";

@Entity({
  customRepository: () => CustomEntityRepository
})
export class OrderSnapshot extends BaseEntity {
  @ManyToOne({ entity: () => Order })
  order!: Order;

  @Property()
  version!: number;

  @Property({
    columnType: "jsonb",
    type: JsonType
  })
  snapshot!: Order;

  @Property({
    persist: false
  })
  get date() {
    return this.created_at;
  }
}
