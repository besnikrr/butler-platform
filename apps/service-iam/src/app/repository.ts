
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import App from "./entities/app";

export interface IAppRepository extends CustomEntityRepository<App> {}
export class AppRepository extends CustomEntityRepository<App> implements IAppRepository {}
