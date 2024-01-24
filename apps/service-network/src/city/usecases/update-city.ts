import { wrap } from "@mikro-orm/core";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { CITY_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { ICity, ICityPublish } from "../entity";
import { ICityRepository } from "../repository";

export interface IUpdateCityInput {
  name: string;
  oms_id?: number;
  time_zone?: string;
  state?: string;
}

export class UpdateCityInput implements IUpdateCityInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsOptional()
  oms_id: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  time_zone: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  state: string;
}

export interface IUpdateCityOutput extends ICity { }

export interface IUpdateCityDependency {
  cityRepository: ICityRepository;
}

export default (dependency: IUpdateCityDependency) => {
  const { cityRepository } = dependency;
  return async (id: number, cityInput: IUpdateCityInput): Promise<IUpdateCityOutput> => {
    await cityRepository.failIfEntityExists({
      name: cityInput.name,
      id: {
        $ne: id
      }
    });
    const city = await cityRepository.getOneEntityOrFail({ id });
    wrap(city).assign(cityInput);
    await cityRepository.flush();
    await eventProvider.client().publish<ICityPublish>(SNS_TOPIC.NETWORK.CITY, CITY_EVENT.UPDATED, null, {
      entity: ENTITY.NETWORK.CITY,
      ...city
    });

    return city;
  };
};
