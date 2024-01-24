import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import Discount from "../entities/discount";
import { DiscountRepository } from "../repository";
import getByCode from "./get-by-code";
import getByCodeAndPhoneNumber from "./get-by-code-and-number";

interface DiscountUsecase {
  getByCode(code: string): Promise<Discount>;
  getByCodeAndPhoneNumber(code: string, phoneNumber: string): Promise<Discount>;
}

export default (dependency: IDefaultUsecaseDependency): DiscountUsecase => {
  const { conn } = dependency;

  return {
    getByCode: getByCode({
      discountRepository: conn.em.getRepository(Discount) as DiscountRepository
    }),
    getByCodeAndPhoneNumber: getByCodeAndPhoneNumber({
      discountRepository: conn.em.getRepository(Discount) as DiscountRepository
    })
  };
};
