
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Hub from "./entity";

export interface IHubRepository extends CustomEntityRepository<Hub> {}
export class HubRepository extends CustomEntityRepository<Hub> implements IHubRepository {}
