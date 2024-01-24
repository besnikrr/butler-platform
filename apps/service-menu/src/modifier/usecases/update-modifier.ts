import { eventProvider } from "@butlerhospitality/service-sdk";
import { MODIFIER_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IModifierPublish } from "../entities/modifier";
import { IModifierRepository } from "../repository";
import { CreateModifierInput, ICreateModifierInput } from "./create-modifier";

export interface IUpdateModifierInput extends ICreateModifierInput {}
export interface IUpdateModifierInput extends ICreateModifierInput { }

export class UpdateModifierInput extends CreateModifierInput implements IUpdateModifierInput { }

export interface IUpdateModifierDependency {
  modifierRepository: IModifierRepository;
}
export default (dependency: IUpdateModifierDependency) => {
  const { modifierRepository } = dependency;
  return async (id: number, data: IUpdateModifierInput) => {
    const modifier = await modifierRepository.getOneEntityOrFail(id);
    modifierRepository.assign(modifier, data);
    await modifierRepository.flush();

    await eventProvider.client().publish<IModifierPublish>(
      SNS_TOPIC.MENU.MODIFIER, MODIFIER_EVENT.UPDATED, null, {
        ...modifier,
        entity: ENTITY.MENU.MODIFIER
      }
    );

    return modifier;
  };
};
