import { CommunicationClient, communicationClient, eventProvider, sendEmail, validateInput, ValidationError } from "@butlerhospitality/service-sdk";
import { JsonType } from "@mikro-orm/core";
import {
  IsOptional, IsNotEmpty, IsNumber, IsString, IsBoolean, IsJSON, MaxLength, IsArray,
  ValidateNested, IsEnum, ArrayNotEmpty, IsDefined, IsObject, IsPositive
} from "class-validator";
import { IHubRepository } from "../../hub/repository";
import { FeeType, IFeeValue, IHotel, IHotelPublish, IOperatingHours, IOrderRange, IServiceFee } from "../entity";
import { IHotelRepository } from "../repository";
import { plainToInstance, Type } from "class-transformer";
import { orderServiceFee } from "../../utils/service-fee";
import { ENTITY, HOTEL_EVENT, MealPeriod, SNS_TOPIC, STAGE } from "@butlerhospitality/shared";
import { buildEmailBody, createButlerMenuQRCodes, getEmailsToNotify, IHotelProcessStatus } from "../../utils/email-notification";
import { EMAILS, EMAIL_STATUS, ONBOARDING_MESSAGE } from "../../utils/constants";
import { getDefaultOperatingHours, OperatingHoursValidation } from "../../utils/operating-hours";

export interface IServiceFeeInput extends IServiceFee {
}

export class OrderRangeInput implements IOrderRange {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  from: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  to: number;
}
export class FeeValueInput implements IFeeValue {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  order: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  fee_amount: number;

  @IsDefined()
  @IsObject()
  @Type(() => OrderRangeInput)
  @ValidateNested()
  order_range: IOrderRange;
}

export class ServiceFeeInput implements IServiceFeeInput {
  @IsNumber()
  @IsOptional()
  menu_id: number;

  @IsNotEmpty()
  @IsEnum(FeeType)
  fee_type: FeeType;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FeeValueInput)
  fee_values: IFeeValue[];
}
export interface ICreateHotelInput {
  oms_id?: number;
  hub_id: number;
  name: string;
  formal_name?: string;
  is_tax_exempt: boolean;
  active: boolean;
  code: string;
  address_street?: string;
  address_number?: string;
  address_town?: string;
  address_zip_code?: string;
  address_coordinates?: string;
  web_active: boolean;
  web_phone?: string;
  web_url_id: string;
  web_code: string;
  contact_person?: string;
  contact_email?: string;
  account_manager_id?: number;
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
  service_fee?: IServiceFee[];
  phone_number?: string;
}

export class CreateHotelInput implements ICreateHotelInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  hub_id: number;

  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  formal_name?: string;

  @IsBoolean()
  @IsOptional()
  is_tax_exempt: boolean;

  @IsBoolean()
  @IsOptional()
  active: boolean;

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
  web_active: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  web_phone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  web_url_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  web_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  code: string;

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
  allow_payment_room_charge: boolean;

  @IsBoolean()
  @IsOptional()
  allow_payment_credit_card: boolean;

  @IsBoolean()
  @IsOptional()
  allow_scheduled_orders: boolean;

  @IsBoolean()
  @IsOptional()
  has_vouchers_enabled: boolean;

  @IsBoolean()
  @IsOptional()
  has_pms_enabled: boolean;

  @IsBoolean()
  @IsOptional()
  has_car_service_enabled: boolean;

  @IsBoolean()
  @IsOptional()
  has_activities_enabled: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ServiceFeeInput)
  service_fee: IServiceFee[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OperatingHoursValidation)
  operating_hours?: IOperatingHours;
}

export interface ICreateHotelOutput extends IHotel { }

export interface ICreateHotelDependency {
  hotelRepository: IHotelRepository;
  hubRepository: IHubRepository;
}

const notifyOnHotelCreate = async (hotel: IHotel, hotelStatus: IHotelProcessStatus) => {
  const attachments = await createButlerMenuQRCodes(hotel, hotelStatus);
  const subject = Object.values(hotelStatus).every(Boolean) ?
    `${hotel.name} ${EMAIL_STATUS.ONBOARDING_COMPLETED}` :
    `${hotel.name} ${EMAIL_STATUS.ONBOARDING_FAILED}`;

  return await sendEmail({
    from: EMAILS.SUPPORT,
    to: getEmailsToNotify(),
    subject: subject,
    attachments: attachments,
    htmlBody: buildEmailBody(hotel, hotelStatus, ONBOARDING_MESSAGE),
    textBody: buildEmailBody(hotel, hotelStatus, ONBOARDING_MESSAGE, false)
  });
};

export default (dependency: ICreateHotelDependency) => {
  const { hotelRepository, hubRepository } = dependency;
  return async (data: ICreateHotelInput, shouldNotify: boolean = true): Promise<ICreateHotelOutput> => {
    await hotelRepository.failIfEntityExists({
      $or: [
        {
          name: { $eq: data.name }
        },
        {
          web_url_id: { $eq: data.web_url_id }
        },
        {
          web_code: { $eq: data.web_code }
        },
        {
          code: { $eq: data.code }
        }
      ]
    });
    const hotelStatus: IHotelProcessStatus = {
      twilio: false,
      created: false
    };

    const operating_hours = getDefaultOperatingHours([
      MealPeriod.Breakfast,
      MealPeriod.Lunch_Dinner,
      MealPeriod.Convenience
    ]);
    const defaultOperatingHours = plainToInstance(OperatingHoursValidation, operating_hours);
    const errors = await validateInput(defaultOperatingHours);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const service_fee = data.service_fee?.length > 0 ? orderServiceFee(data.service_fee) : [];

    const hub = await hubRepository.getOneEntityOrFail(data.hub_id, ["city"]);
    const twilioClient = await communicationClient(CommunicationClient.TWILIO);
    const phoneNumberDetails = await twilioClient.provisionPhoneNumber({
      coordinates: hub.address_coordinates,
      name: data.name,
      voiceUrl: hub.city.voice_url
    });
    if (phoneNumberDetails) {
      hotelStatus.twilio = true;
    }

    const hotel = hotelRepository.create({
      ...data,
      phone_number: phoneNumberDetails?.phoneNumber,
      service_fee,
      operating_hours,
      web_active: true
    });
    hub.hotels.add(hotel);
    await hotelRepository.persistAndFlush(hotel).then(() => {
      hotelStatus.created = true;
    });

    await eventProvider.client().publish<IHotelPublish>(SNS_TOPIC.NETWORK.HOTEL, HOTEL_EVENT.CREATED_ADAPTER, null, {
      ...hotel,
      entity: ENTITY.NETWORK.HOTEL
    });

    if (shouldNotify && process.env.STAGE === STAGE.prod) {
      await notifyOnHotelCreate(hotel, hotelStatus);
    }

    await hotelRepository.populate(hotel, ["hub"]);
    return hotel;
  };
};
