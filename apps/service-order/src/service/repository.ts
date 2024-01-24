import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import { Service } from "./entity";

export interface IServiceRepository extends CustomEntityRepository<Service> { }
export class ServiceRepository extends CustomEntityRepository<Service> implements IServiceRepository { }
