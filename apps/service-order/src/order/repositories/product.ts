import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderCustomProduct, OrderProduct } from "../entity";

export interface IOrderProductRepository extends CustomEntityRepository<OrderProduct> { }
export class OrderProductRepository
  extends CustomEntityRepository<OrderProduct>
  implements IOrderProductRepository { }

export interface IOrderCustomProductRepository extends CustomEntityRepository<OrderCustomProduct> { }
export class OrderCustomProductRepository
  extends CustomEntityRepository<OrderCustomProduct>
  implements IOrderCustomProductRepository { }
