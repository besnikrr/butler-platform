import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { OrderMeta } from "../entity";

export interface IOrderMetaRepository extends CustomEntityRepository<OrderMeta> { }
export class OrderMetaRepository extends CustomEntityRepository<OrderMeta> implements IOrderMetaRepository { }
