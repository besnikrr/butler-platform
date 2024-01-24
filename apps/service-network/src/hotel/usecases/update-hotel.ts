import { wrap, JsonType } from "@mikro-orm/core";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, HOTEL_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import { IsArray, IsBoolean, IsDefined, IsJSON, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { IHotel, IHotelPublish, IOperatingHours, IServiceFee } from "../entity";
import { IHubRepository } from "../../hub/repository";
import { IHotelRepository } from "../repository";
import { Type } from "class-transformer";
import { ServiceFeeInput } from "./create-hotel";
import { orderServiceFee } from "../../utils/service-fee";
import { OperatingHoursValidation } from "../../utils/operating-hours";

export interface IUpdateHotelInput {
  hub_id?: number;
  name?: string;
  formal_name?: string;
  is_tax_exempt?: boolean;
  active?: boolean;
  code?: string;
  address_street?: string;
  address_number?: string;
  address_town?: string;
  address_zip_code?: string;
  address_coordinates?: string;
  web_active?: boolean;
  web_phone?: string;
  web_url_id?: string;
  web_code?: string;
  contact_person?: string;
  contact_email?: string;
  account_manager_id?: number;
  room_count?: number;
  room_numbers?: JsonType;
  delivery_instructions?: string;
  reskin_config?: JsonType;
  allow_payment_room_charge?: boolean;
  allow_payment_credit_card?: boolean;
  allow_scheduled_orders?: boolean;
  has_vouchers_enabled?: boolean;
  has_pms_enabled?: boolean;
  has_car_service_enabled?: boolean;
  has_activities_enabled?: boolean;
  operating_hours?: IOperatingHours;
  service_fee?: IServiceFee[];
  phone_number?: string;
}

export class UpdateHotelInput implements IUpdateHotelInput {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  name?: string;

  @IsNumber()
  @IsOptional()
  hub_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  formal_name?: string;

  @IsBoolean()
  @IsOptional()
  is_tax_exempt?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(6)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_street?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  address_number?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_town?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  address_zip_code?: string;

  @IsString()
  @IsOptional()
  address_coordinates?: string;

  @IsBoolean()
  @IsOptional()
  web_active?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  web_phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  web_url_id?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  web_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  contact_person?: string;

  @IsString()
  @IsOptional()
  contact_email?: string;

  @IsNumber()
  @IsOptional()
  account_manager_id?: number;

  @IsNumber()
  @IsOptional()
  room_count?: number;

  @IsJSON()
  @IsOptional()
  room_numbers?: JsonType;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  delivery_instructions?: string;

  @IsJSON()
  @IsOptional()
  reskin_config?: JsonType;

  @IsBoolean()
  @IsOptional()
  allow_payment_room_charge?: boolean;

  @IsBoolean()
  @IsOptional()
  allow_payment_credit_card?: boolean;

  @IsBoolean()
  @IsOptional()
  allow_scheduled_orders?: boolean;

  @IsBoolean()
  @IsOptional()
  has_vouchers_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  has_pms_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  has_car_service_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  has_activities_enabled?: boolean;

  @IsDefined()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursValidation)
  operating_hours?: IOperatingHours;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceFeeInput)
  service_fee: IServiceFee[];

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone_number?: string;
}

export interface IUpdateHotelOutput extends IHotel { }

export interface IUpdateHotelDependency {
  hotelRepository: IHotelRepository;
  hubRepository: IHubRepository;
}

export default (dep: IUpdateHotelDependency) => {
  const { hotelRepository, hubRepository } = dep;
  return async (id: number, hotelInput: IUpdateHotelInput): Promise<IUpdateHotelOutput> => {
    const hotel = await hotelRepository.getOneEntityOrFail({ id });
    if (hotelInput.name || hotelInput.web_url_id || hotelInput.web_code || hotelInput.code) {
      await hotelRepository.failIfEntityExists({
        $or: [
          (hotelInput.name && {
            name: { $eq: hotelInput.name }
          }),
          (hotelInput.web_url_id && {
            web_url_id: { $eq: hotelInput.web_url_id }
          }),
          (hotelInput.web_code && {
            web_code: { $eq: hotelInput.web_code }
          }),
          (hotelInput.code && {
            code: { $eq: hotelInput.code }
          })
        ],
        id: {
          $ne: id
        }
      });
    }

    if (hotelInput.hub_id) {
      await hubRepository.getOneEntityOrFail({ id: hotelInput.hub_id });
    }

    wrap(hotel).assign({
      ...hotelInput,
      hub: hotelInput.hub_id ?? hotel.hub.id,
      ...(hotelInput.service_fee?.length ? { service_fee: orderServiceFee(hotelInput.service_fee) } : {})
    });
    await hotelRepository.flush();

    await eventProvider.client().publish<IHotelPublish>(SNS_TOPIC.NETWORK.HOTEL, HOTEL_EVENT.UPDATED, null, {
      entity: ENTITY.NETWORK.HOTEL,
      ...hotel
    });
    await hotelRepository.populate(hotel, ["hub"]);
    return hotel;
  };
};
