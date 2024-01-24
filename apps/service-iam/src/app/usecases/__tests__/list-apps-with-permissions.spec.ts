
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { EntityManager, Knex } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Permission from "../../../permission-group/entities/permission";
import listAppsWithPermissions from "../list-apps-with-permissions";
import { IAMEntities } from "../../../entities";
import App from "../../entities/app";

describe("List apps with permissions usecase", () => {
  const validateKeysToHave = (appObj: App) => {
    expect(appObj).toBeDefined();
    expect(appObj).toHaveProperty("id");
    expect(appObj).toHaveProperty("name");
    expect(appObj).toHaveProperty("permissions");
  };

  const validatePermissions = (permissions: Permission[]) => {
    for (const permission of permissions) {
      expect(permission).toBeDefined();
      expect(permission).toHaveProperty("id");
      expect(permission).toHaveProperty("name");
    }
  };

  let orm: MikroORM;
  let knex: Knex;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, IAMEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    knex = (conn.em as EntityManager).getKnex();
  });

  it("should list apps with permissions", async () => {
    const apps = await listAppsWithPermissions({ knex })();

    for (const app of apps) {
      validateKeysToHave(app);
      validatePermissions(app.permissions);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm.close(true);
  });
});
