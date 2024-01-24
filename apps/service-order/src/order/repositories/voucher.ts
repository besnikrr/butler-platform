import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderVoucher } from "../entity";

export interface IOrderVoucherRepository extends CustomEntityRepository<OrderVoucher> { }
export class OrderVoucherRepository extends CustomEntityRepository<OrderVoucher>
  implements IOrderVoucherRepository { }
