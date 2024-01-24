
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listModifiers, { ModifierFilter } from "./list-modifiers";
import getModifier from "./get-modifier";
import createModifier, { ICreateModifierInput } from "./create-modifier";
import updateModifier, { IUpdateModifierInput } from "./update-modifier";
import deleteModifier from "./delete-modifier";

import Modifier from "../entities/modifier";
import { IModifierRepository } from "../repository";

export interface ModifierUseCase {
  listModifiers(req: ModifierFilter): Promise<[Modifier[], number]>;
  getModifier(id: number): Promise<Modifier>;
  createModifier(modifier: ICreateModifierInput): Promise<Modifier>;
  updateModifier(id: number, modifier: IUpdateModifierInput): Promise<Modifier>;
  deleteModifier(id: number): Promise<boolean>;
}

export default (dependency: IDefaultUsecaseDependency): ModifierUseCase => {
  const { conn } = dependency;
  return {
    listModifiers: listModifiers({
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository
    }),
    getModifier: getModifier({
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository
    }),
    createModifier: createModifier({
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository
    }),
    updateModifier: updateModifier({
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository
    }),
    deleteModifier: deleteModifier({
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository
    })
  };
};
