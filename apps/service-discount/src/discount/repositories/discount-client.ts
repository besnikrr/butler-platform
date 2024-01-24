
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import DiscountClient from "../entities/discount-client";

export interface IDiscountClientRepository extends CustomEntityRepository<DiscountClient> { }
export class DiscountClientRepository
  extends CustomEntityRepository<DiscountClient>
  implements IDiscountClientRepository { }
