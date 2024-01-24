import { EntityManager } from "@mikro-orm/postgresql";
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listAppsWithPermissions from "./list-apps-with-permissions";
import listApps from "./list-apps";

import App from "../entities/app";
import { IAppRepository } from "../repository";

export interface AppUsecase {
  listAppsWithPermissions(): Promise<App[]>;
  listApps(): Promise<[App[], number]>;
}

export default (dependency: IDefaultUsecaseDependency): AppUsecase => {
  const { conn } = dependency;
  const appRepository = conn.em.getRepository(App) as IAppRepository;
  const knex = (conn.em as EntityManager).getKnex();
  return {
    listAppsWithPermissions: listAppsWithPermissions({ knex }),
    listApps: listApps({ appRepository })
  };
};
