import { IDiscountRepository } from "../repositories/discount";
import { IDiscountClientRepository } from "../repositories/discount-client";

export interface IRedeemDiscountDependency {
  discountRepository: IDiscountRepository;
  discountClientRepository: IDiscountClientRepository;
}

export default (dependency: IRedeemDiscountDependency) => {
  const {
    discountRepository,
    discountClientRepository
  } = dependency;

  return async (id: number, amountUsed: number, clientPhoneNumber: string): Promise<void> => {
    const discount = await discountRepository.getOneEntityOrFail(id, ["discountClients"]);
    const discountClient = discountClientRepository.create({
      amountUsed,
      clientPhoneNumber
    });

    discount.discountClients.add(discountClient);

    await discountRepository.flush();
  };
};
