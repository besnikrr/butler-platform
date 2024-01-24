
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IAMEntities } from "../../../entities";
import listApps from "../list-apps";
import App from "../../entities/app";
import { IAppRepository } from "../../repository";

describe("List apps usecase", () => {
  const validateKeysToHave = (appObj) => {
    expect(appObj).toBeDefined();
    expect(appObj).toHaveProperty("id");
    expect(appObj).toHaveProperty("name");
    expect(appObj).toHaveProperty("description");
  };

  let orm: MikroORM;
  let appRepository: IAppRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    appRepository = conn.em.getRepository(App);
  });

  it("should list apps", async () => {
    const apps = await listApps({ appRepository })();

    for (const app of apps[0]) {
      validateKeysToHave(app);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
