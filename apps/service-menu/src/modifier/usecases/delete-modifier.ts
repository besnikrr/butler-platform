import { eventProvider } from "@butlerhospitality/service-sdk";
import { MODIFIER_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import { IModifierRepository } from "../repository";

export interface IDeleteModifierDependency {
  modifierRepository: IModifierRepository;
}

export default (dependency: IDeleteModifierDependency) => {
  const { modifierRepository } = dependency;
  return async (id: number): Promise<boolean> => {
    const modifier = await modifierRepository.getOneEntityOrFail(id);
    modifier.options.removeAll();
    const deleted = await modifierRepository.softDelete(id);

    await eventProvider.client().publish<{ id: number; entity: string }>(
      SNS_TOPIC.MENU.MODIFIER, MODIFIER_EVENT.DELETED, null, {
        id,
        entity: ENTITY.MENU.MODIFIER
      }
    );

    return deleted;
  };
};
