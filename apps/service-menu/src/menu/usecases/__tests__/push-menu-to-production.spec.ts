
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import {
  BadRequestError,
  clearDatabase,
  CustomEntityRepository,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import pushMenuToProduction from "../push-menu-to-production";
import Menu from "../../entities/menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Push menu to production", () => {
  let orm: MikroORM;
  let menuRepository: CustomEntityRepository<Menu>;
  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    testMenu = await menuRepository.findOne({});
  });

  it("should fail to push a menu to production", async () => {
    await expect(async () => pushMenuToProduction({ menuRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  it("should fail to push a menu to production because of the app stage", async () => {
    process.env.STAGE = "bad";
    await expect(async () => pushMenuToProduction({ menuRepository })(testMenu.id)).rejects.toThrow(BadRequestError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
