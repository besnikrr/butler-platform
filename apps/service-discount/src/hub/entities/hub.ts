import { BaseEntity } from "@butlerhospitality/service-sdk";
import { Collection, Entity, ManyToMany, Property } from "@mikro-orm/core";
import { Discount } from "../../discount/entity";
import { HubRepository } from "../repositories/hub";

@Entity({
  customRepository: () => HubRepository
})
export default class Hub extends BaseEntity {
  @Property({ length: 255 })
  name!: string;

	@Property()
	active!: boolean;

  @Property({
    unique: true,
    columnType: "bigint",
    nullable: true
  })
  oms_id?: number;

	@ManyToMany(() => Discount, (discount) => discount.hubs)
	discounts = new Collection<Discount>(this);
}
