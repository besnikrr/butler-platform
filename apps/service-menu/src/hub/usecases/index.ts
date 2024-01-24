import { MikroORM } from "@mikro-orm/core";
import Hub from "../entities/hub";
import listHubs, { HubFilter } from "./list-hubs";

export interface HubUseCase {
  listHubs(req: HubFilter): Promise<[Hub[], number]>;
}

export default (conn: MikroORM): HubUseCase => {
  return {
    listHubs: listHubs({
      hubRepository: conn.em.getRepository(Hub)
    })
  };
};
