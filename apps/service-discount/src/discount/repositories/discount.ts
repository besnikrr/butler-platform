
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Discount from "../entities/discount";

export interface IDiscountRepository extends CustomEntityRepository<Discount> {
  getWithAmountUsedPerClient(code: string, clientPhoneNumber: string): Promise<Discount>;
}
export class DiscountRepository extends CustomEntityRepository<Discount> implements IDiscountRepository {
  async getWithAmountUsedPerClient(code: string, clientPhoneNumber: string): Promise<Discount> {
    const discount = await this.getOneEntityOrFail({ code });

    const discountClients = await discount.discountClients.init({
      where: {
        clientPhoneNumber
      }
    });

    const clientAmountUsed = discountClients.getItems().map((discountClient) => discountClient.amountUsed);
    const totalAmountUsed = clientAmountUsed.reduce((acc: number, amount: number) => acc + amount, 0);

    return {
      ...discount,
      amountUsed: totalAmountUsed
    };
  }
}
