import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderStatusChange } from "../entity";

export interface IOrderStatusChangeRepository extends CustomEntityRepository<OrderStatusChange> { }
export class OrderStatusChangeRepository extends CustomEntityRepository<OrderStatusChange>
  implements IOrderStatusChangeRepository { }
