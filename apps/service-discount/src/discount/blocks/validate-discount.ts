import { BadRequestError } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { Hub } from "../../hub/entity";
import { HubRepository } from "../../hub/repository";
import Discount from "../entities/discount";
import { DiscountRepository } from "../repository";
export interface IValidateDiscountDependency {
  connection: MikroORM;
}
export interface IHub {
  id: number;
  name: string;
}

export interface IDiscount {
  id: number;
  code: string;
  hub: IHub;
}

export interface IValidateVoucherDependenciesInput {
  discount: IDiscount;
}

export default (
  dependency: IValidateDiscountDependency
) => {
  return async (input: IValidateVoucherDependenciesInput): Promise<void> => {
    const hubRepository = dependency.connection.em.getRepository(Hub) as HubRepository;
    const discountRepository = dependency.connection.em.getRepository(Discount) as DiscountRepository;
    const discount = await discountRepository.getOneEntityOrFail(input.discount.id, ["hubs"]);

    if (discount.code !== input.discount.code) {
      throw new BadRequestError(`Discount code '${input.discount.code}' is invalid.`);
    }

    if (discount.startDate.getTime() > Date.now()) {
      throw new BadRequestError(`Discount code '${input.discount.code}' cannot be used until ${discount.startDate}.`);
    }

    if (discount.endDate?.getTime() < Date.now()) {
      throw new BadRequestError(`Discount code '${input.discount.code}' has expired.`);
    }

    if (!discount.hubs.contains(hubRepository.getReference(input.discount.hub.id))) {
      throw new BadRequestError(
        `Discount code '${input.discount.code}' cannot be used for the '${input.discount.hub.name}' hub.`
      );
    }
  };
};
