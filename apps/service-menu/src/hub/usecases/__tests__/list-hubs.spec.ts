import {
  clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Hub from "../../entities/hub";
import listHubs from "../list-hubs";
import { IHubRepository } from "../../repository";
import { MenuEntities } from "../../../entities";

describe("List hubs usecase", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let hubToSearch: Hub;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    hubRepository = conn.em.getRepository(Hub);
  });

  it("should list hubs", async () => {
    const [hubs, count] = await listHubs({ hubRepository })({
      page: 1,
      limit: 10
    });
    hubToSearch = hubs[0];
    hubs.map((hub) => expectResponseToHaveKeys(hub));
    expect(count).toBeGreaterThan(0);
  });

  it("should filter hubs by name", async () => {
    const [hubs, count] = await listHubs({ hubRepository })({ name: hubToSearch.name, page: 1, limit: 10 });

    hubs.forEach((hub) => {
      expectResponseToHaveKeys(hub);
      expect(hub.name).toContain(hubToSearch.name);
    });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });

  const expectResponseToHaveKeys = (hub: Hub) => {
    for (const property of Object.getOwnPropertyNames(hub)) {
      expect(hub).toHaveProperty(property);
    }
  };
});
