import { BaseEntity, CustomEntityRepository } from "@butlerhospitality/service-sdk";
import {
  Collection, Entity, ManyToMany, ManyToOne, Property, Unique
} from "@mikro-orm/core";
import { PaymentProvider } from "../payment/entity";
import { ServiceRepository } from "./repository";

@Entity({
  customRepository: () => ServiceRepository
})
export class ServiceType extends BaseEntity {
  @Unique()
  @Property({ length: 255 })
  name!: string;
}

@Entity({
  customRepository: () => CustomEntityRepository
})
export class Service extends BaseEntity {
  @ManyToOne({ entity: () => ServiceType })
  serviceType!: ServiceType;

  @Unique()
  @Property({ length: 255 })
  name!: string;

  @ManyToMany(() => PaymentProvider, "services", { owner: true, pivotTable: "service_payment_provider" })
  paymentProviders = new Collection<PaymentProvider>(this);
}
