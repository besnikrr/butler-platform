import { IDiscountRepository } from "../repository";

interface IGetDiscountCodeDependency {
  discountRepository: IDiscountRepository;
}

export default (dependency: IGetDiscountCodeDependency) => {
  const repository = dependency.discountRepository;

  return async (code: string) => repository.getOneEntityOrFail({ code }, ["hubs"]);
};
