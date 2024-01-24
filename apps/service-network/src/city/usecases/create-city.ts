import { CITY_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { eventProvider } from "@butlerhospitality/service-sdk";
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength
} from "class-validator";
import { ICity, ICityPublish } from "../entity";
import { ICityRepository } from "../repository";

export interface ICreateCityInput {
  name: string;
  oms_id?: number;
  time_zone: string;
  state?: string;
}

export class CreateCityInput implements ICreateCityInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  time_zone: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  state?: string;
}

export interface ICreateCityOutput extends ICity { }

export interface ICreateCityDependency {
  cityRepository: ICityRepository;
}

export default (dependency: ICreateCityDependency) => {
  const { cityRepository } = dependency;

  return async (data: ICreateCityInput): Promise<ICreateCityOutput> => {
    await cityRepository.failIfEntityExists({
      name: data.name
    });
    const city = cityRepository.create(data);
    await cityRepository.persistAndFlush(city);
    await eventProvider.client().publish<ICityPublish>(
      SNS_TOPIC.NETWORK.CITY, CITY_EVENT.CREATED, null, {
        entity: ENTITY.NETWORK.CITY,
        ...city
      }
    );

    return city;
  };
};
