import { DiscountRepository } from "../repository";

export interface IGetCodeDependency {
  discountRepository: DiscountRepository;
}

export default (dependency: IGetCodeDependency) => {
  const repository = dependency.discountRepository;

  return async (id: number) => repository.getOneEntityOrFail(id);
};
