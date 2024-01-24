import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderDiscount } from "../entity";

export interface IOrderDiscountRepository extends CustomEntityRepository<OrderDiscount> { }
export class OrderDiscountRepository
  extends CustomEntityRepository<OrderDiscount>
  implements IOrderDiscountRepository { }
