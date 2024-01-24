import { SNS_TOPIC, ENTITY, HUB_EVENT } from "@butlerhospitality/shared";
import { eventProvider } from "@butlerhospitality/service-sdk";
import {
  IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min
} from "class-validator";
import { ICityRepository } from "../../city/repository";
import { IHub, IHubPublish } from "../entity";
import { IHubRepository } from "../repository";

export interface ICreateHubInput {
  id?: number;
  name: string;
  city_id: number;
  oms_id?: number;
  tax_rate: number;
  contact_phone?: string;
  contact_email?: string;
  address_street?: string;
  address_number?: string;
  address_town?: string;
  address_zip_code?: string;
  address_coordinates?: string;
  has_nextmv_enabled?: boolean;
  active?: boolean;
  has_expeditor_app_enabled?: boolean;
  color: string;
}

export class CreateHubInput implements ICreateHubInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  city_id: number;

  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsNumber()
  @Min(0)
  @Max(99.99999)
  tax_rate: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contact_phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contact_email?: string;

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
  @IsNotEmpty()
  @MaxLength(10)
  color!: string;

  @IsString()
  @IsOptional()
  address_coordinates?: string;

  @IsBoolean()
  @IsOptional()
  has_nextmv_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  has_expeditor_app_enabled?: boolean;
}

export interface ICreateHubOutput extends IHub { }

export interface ICreateHubDependency {
  hubRepository: IHubRepository;
  cityRepository: ICityRepository;
}

export default (dependency: ICreateHubDependency) => {
  const { hubRepository, cityRepository } = dependency;
  return async (data: ICreateHubInput): Promise<ICreateHubOutput> => {
    await hubRepository.failIfEntityExists({
      name: data.name
    });

    const city = await cityRepository.getOneEntityOrFail({ id: data.city_id });
    const hub = hubRepository.create(data);
    city.hubs.add(hub);
    await hubRepository.persistAndFlush(hub);
    await eventProvider.client().publish<IHubPublish>(SNS_TOPIC.NETWORK.HUB, HUB_EVENT.CREATED_ADAPTER, null, {
      ...hub,
      entity: ENTITY.NETWORK.HUB
    });
    return hub;
  };
};
