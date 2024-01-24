import { eventProvider } from "@butlerhospitality/service-sdk";
import { ENTITY, SNS_TOPIC, LABEL_EVENT } from "@butlerhospitality/shared";
import { ILabelPublish } from "../entities/label";
import { ILabelRepository } from "../repository";
import { CreateLabelInput, ICreateLabelInput } from "./create-label";

export interface IUpdateLabelInput extends ICreateLabelInput { }
export interface IUpdateLabelInput extends ICreateLabelInput { }

export class UpdateLabelInput extends CreateLabelInput implements IUpdateLabelInput { }

export interface IUpdateLabelDependency {
  labelRepository: ILabelRepository;
}
export default (dependency: IUpdateLabelDependency) => {
  const { labelRepository } = dependency;
  return async (id: number, data: IUpdateLabelInput) => {
    const label = await labelRepository.getOneEntityOrFail(id);
    await labelRepository.failIfEntityExists({
      name: data.name,
      id: {
        $ne: id
      }
    });
    labelRepository.assign(label, data);
    await labelRepository.flush();

    await eventProvider.client().publish<ILabelPublish>(
      SNS_TOPIC.MENU.LABEL, LABEL_EVENT.UPDATED, null, {
        ...label,
        entity: ENTITY.MENU.LABEL
      }
    );

    return label;
  };
};
