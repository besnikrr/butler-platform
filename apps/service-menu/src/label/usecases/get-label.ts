import { ILabel } from "../entities/label";
import { ILabelRepository } from "../repository";

export interface IGetLabelDependency {
  labelRepository: ILabelRepository;
}

export default (dependency: IGetLabelDependency) => {
  const { labelRepository } = dependency;

  return async (id: number): Promise<ILabel> => {
    return labelRepository.getOneEntityOrFail(id, ["products"]);
  };
};
