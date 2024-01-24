import { BadRequestError } from "@butlerhospitality/service-sdk";
import { DiscountRepository, IDiscountRepository } from "../repository";

interface IGetDiscountCodeDependency {
  discountRepository: IDiscountRepository;
}

export default (dependency: IGetDiscountCodeDependency) => {
  const repository = dependency.discountRepository as DiscountRepository;

  return async (code: string, phoneNumber: string) => {
    const discount = await repository.getWithAmountUsedPerClient(code, phoneNumber);

    if (discount.startDate.getTime() > Date.now()) {
      throw new BadRequestError(`Discount code '${code}' cannot be used until ${discount.startDate}.`);
    }

    if (discount.endDate?.getTime() < Date.now()) {
      throw new BadRequestError(`Discount code '${code}' has expired.`);
    }

    return discount;
  };
};
