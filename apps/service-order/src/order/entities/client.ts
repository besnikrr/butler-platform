import { BaseEntity } from "@butlerhospitality/service-sdk";
import { Entity, Property } from "@mikro-orm/core";

@Entity()
export class OrderClient extends BaseEntity {
  @Property({
    length: 255
  })
  name!: string;

  @Property({
    length: 50
  })
  phoneNumber!: string;

  @Property({
    length: 50,
    nullable: true
  })
  email?: string;
}
