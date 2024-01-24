import { eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, LABEL_EVENT, SNS_TOPIC } from "@butlerhospitality/shared";
import {
  IsNotEmpty, IsString, MaxLength
} from "class-validator";
import { ILabel, ILabelPublish } from "../entities/label";
import { ILabelRepository } from "../repository";

export interface ICreateLabelInput {
  name: string;
}

export class CreateLabelInput implements ICreateLabelInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

export interface ICreateLabelDependency {
  labelRepository: ILabelRepository;
}

export default (dependency: ICreateLabelDependency) => {
  const { labelRepository } = dependency;

  return async (data: ICreateLabelInput): Promise<ILabel> => {
    await labelRepository.failIfEntityExists({
      name: data.name
    });
    const label = labelRepository.create({ name: data.name });
    await labelRepository.persistAndFlush(label);

    await eventProvider.client().publish<ILabelPublish>(
      SNS_TOPIC.MENU.LABEL, LABEL_EVENT.CREATED, null, {
        ...label,
        entity: ENTITY.MENU.LABEL
      }
    );

    return label;
  };
};
