
import {
  IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { MODIFIER_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Modifier, { IModifierPublish } from "../entities/modifier";
import { IModifierRepository } from "../repository";

interface ICreateModifierOptionInput {
  name: string;
  price: number;
}

class CreateModifierOptionInput implements ICreateModifierOptionInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export interface ICreateModifierInput {
  name: string;
  multiselect: boolean;
  options: CreateModifierOptionInput[];
}

export class CreateModifierInput implements ICreateModifierInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsBoolean()
  @IsNotEmpty()
  multiselect: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModifierOptionInput)
  @IsNotEmpty()
  options: CreateModifierOptionInput[];
}

export interface ICreateModifierDependency {
  modifierRepository: IModifierRepository;
}

export default (dependency: ICreateModifierDependency) => {
  const { modifierRepository } = dependency;
  return async (data: ICreateModifierInput): Promise<Modifier> => {
    const modifier = modifierRepository.create(data);
    await modifierRepository.persistAndFlush(modifier);
    await eventProvider.client().publish<IModifierPublish>(
      SNS_TOPIC.MENU.MODIFIER, MODIFIER_EVENT.CREATED, null, {
        ...modifier,
        entity: ENTITY.MENU.MODIFIER
      }
    );

    return modifier;
  };
};
