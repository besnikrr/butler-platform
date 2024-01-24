/* eslint-disable unused-imports/no-unused-vars */
import { wrap } from "@mikro-orm/core";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { HUB_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { IHub, IHubPublish } from "../entity";
import Hotel from "../../hotel/entity";
import { IHubRepository } from "../repository";
import { ICityRepository } from "../../city/repository";

export interface IUpdateHubInput {
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
  hotels?: Hotel[];
  color: string;
}

export class UpdateHubInput implements IUpdateHubInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsOptional()
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
  contact_phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contact_email: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_street: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  address_number: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_town: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  address_zip_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  color!: string;

  @IsString()
  @IsOptional()
  address_coordinates: string;

  @IsBoolean()
  @IsOptional()
  has_nextmv_enabled: boolean;

  @IsBoolean()
  @IsOptional()
  has_expeditor_app_enabled: boolean;
}

export interface IUpdateHubOutput extends IHub { }

export interface IUpdateHubDependecy {
  hubRepository: IHubRepository;
  cityRepository: ICityRepository;
}

export default (dependency: IUpdateHubDependecy) => {
  const { hubRepository, cityRepository } = dependency;
  return async (id: number, hubInput: IUpdateHubInput): Promise<IUpdateHubOutput> => {
    const hub = await hubRepository.getOneEntityOrFail({ id });
    await hubRepository.failIfEntityExists({
      name: hubInput.name,
      id: {
        $ne: id
      }
    });

    if (hubInput.city_id) {
      await cityRepository.getOneEntityOrFail({ id: hubInput.city_id });
    }

    const { hotels, ...data } = hubInput;
    wrap(hub).assign({ ...data, city: hubInput.city_id ?? hub.city.id });
    await hubRepository.flush();
    await eventProvider.client().publish<IHubPublish>(SNS_TOPIC.NETWORK.HUB, HUB_EVENT.UPDATED, null, {
      entity: ENTITY.NETWORK.HUB,
      ...hub
    });
    await hubRepository.populate(hub, ["city"]);
    return hub;
  };
};
