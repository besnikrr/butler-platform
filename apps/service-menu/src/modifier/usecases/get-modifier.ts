import Modifier from "../entities/modifier";
import { IModifierRepository } from "../repository";

export interface IGetModifierDependency {
  modifierRepository: IModifierRepository;
}

export default (dependency: IGetModifierDependency) => {
  const { modifierRepository } = dependency;
  return async (id: number): Promise<Modifier> => {
    return modifierRepository.getOneEntityOrFail(id, ["options"]);
  };
};
