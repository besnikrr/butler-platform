
import { BaseEntity, IPublishableEntity } from "@butlerhospitality/service-sdk";
import { MealPeriod } from "@butlerhospitality/shared";
import {
  Entity, Property, ManyToOne, Unique, JsonType
} from "@mikro-orm/core";
import Hub from "../hub/entity";
import User from "../user/entity";
import { HotelRepository } from "./repository";

export interface IOperatingHours {
  [MealPeriod.Breakfast]: string;
  [MealPeriod.Lunch_Dinner]: string;
  [MealPeriod.Convenience]: string;
}

export enum FeeType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_PRICE = "FIXED_PRICE"
}

export interface IOrderRange {
  from: number,
  to: number
}

export interface IFeeValue {
  order: number,
  fee_amount: number,
  order_range: IOrderRange
}

export interface IServiceFee {
  menu_id: number,
  fee_type: FeeType,
  fee_values: IFeeValue[]
}

export interface IHotel {
  id?: number;
  oms_id?: number;
  hub: Hub;
  name: string;
  formal_name?: string;
  is_tax_exempt: boolean;
  active?: boolean;
  code?: string;
  address_street?: string;
  address_number?: string;
  address_town?: string;
  address_zip_code?: string;
  address_coordinates?: string;
  web_active: boolean;
  web_phone?: string;
  web_url_id?: string;
  web_code?: string;
  contact_person?: string;
  contact_email?: string;
  account_manager_id?: number;
  account_manager?: User;
  room_count?: number;
  room_numbers?: JsonType;
  delivery_instructions?: string;
  reskin_config?: JsonType;
  allow_payment_room_charge: boolean;
  allow_payment_credit_card: boolean;
  allow_scheduled_orders: boolean;
  has_vouchers_enabled: boolean;
  has_pms_enabled: boolean;
  has_car_service_enabled: boolean;
  has_activities_enabled: boolean;
  operating_hours?: IOperatingHours;
  menu_id?: number;
	phone_number?: string;
}

export interface IHotelPublish extends IPublishableEntity { }

@Entity({
  customRepository: () => HotelRepository
})
export default class Hotel extends BaseEntity implements IHotel {
  @Property({ nullable: true }) // TODO nullable: false when adapter is finished
  @Unique()
  oms_id?: number;

  @ManyToOne({ entity: () => Hub })
  hub!: Hub;

  @Property({ length: 500 })
  name!: string;

  @Property({ length: 255, nullable: true })
  formal_name?: string;

  @Property({ default: false })
  is_tax_exempt: boolean = false;

  @Property({ default: true })
  active: boolean = true;

  @Property({ length: 255, nullable: true })
  code?: string;

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

  @Property({ default: false })
  web_active: boolean = false;

  @Property({ length: 255, nullable: true })
  web_phone?: string;

  @Property({ length: 255, nullable: true })
  web_url_id?: string;

  @Property({ length: 255, nullable: true })
  web_code?: string;

  @Property({ length: 255, nullable: true })
  contact_person?: string;

  @Property({ nullable: true })
  contact_email?: string;

  @Property({ nullable: true })
  account_manager_id?: number;

  @ManyToOne({ entity: () => User, nullable: true, joinColumn: "account_manager_id" })
  account_manager?: User;

  @Property({ nullable: true })
  room_count?: number;

  @Property({ nullable: true })
  room_numbers?: JsonType;

  @Property({ length: 500, nullable: true })
  delivery_instructions?: string;

  @Property({ nullable: true, default: "[]" })
  reskin_config?: JsonType;

  @Property({ default: false })
  allow_payment_room_charge: boolean = false;

  @Property({ default: false })
  allow_payment_credit_card: boolean = false;

  @Property({ default: false })
  allow_scheduled_orders: boolean = false;

  @Property({ default: false })
  has_vouchers_enabled: boolean = false;

  @Property({ default: false })
  has_pms_enabled: boolean = false;

  @Property({ default: false })
  has_car_service_enabled: boolean = false;

  @Property({ default: false })
  has_activities_enabled: boolean = false;

  @Property({ nullable: true, default: "[]" })
  operating_hours?: IOperatingHours;

  @Property({ nullable: true, default: "[]" })
  service_fee?: IServiceFee;

  @Property({ nullable: true })
  menu_id?: number;

	@Property({ length: 255, nullable: true })
  phone_number?: string;
}
