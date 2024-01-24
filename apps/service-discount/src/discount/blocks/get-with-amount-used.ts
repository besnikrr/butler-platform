import { DiscountRepository } from "../repository";

export interface IGetCodeDependency {
  discountRepository: DiscountRepository;
}

export default (dependency: IGetCodeDependency) => {
  const repository = dependency.discountRepository;

  return async (code: string, phoneNumber: string) => repository.getWithAmountUsedPerClient(code, phoneNumber);
};
