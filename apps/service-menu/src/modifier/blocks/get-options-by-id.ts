import { IModifierOptionRepository } from "../repository";

interface IGetOptionsByIDDependency {
  modifierOptionRepository: IModifierOptionRepository;
}

export default (dependency: IGetOptionsByIDDependency) => {
  return async (ids: number[]) => dependency.modifierOptionRepository.find(ids);
};
