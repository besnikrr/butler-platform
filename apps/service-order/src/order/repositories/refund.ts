import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderRefund } from "../entity";

export interface IOrderRefundRepository extends CustomEntityRepository<OrderRefund> { }
export class OrderRefundRepository extends CustomEntityRepository<OrderRefund> implements IOrderRefundRepository { }
