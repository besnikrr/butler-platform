
import { MikroORM } from "@mikro-orm/core";
import {
  NotFoundError, clearDatabase, seedDatabase, getTestConnection
} from "@butlerhospitality/service-sdk";
import * as path from "path";
import getMenu, { FormattedMenuResponse } from "../get-menu";
import { IMenuRepository } from "../../repository";
import Menu from "../../entities/menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Get menu", () => {
  const expectResponseToHaveKeys = (menu: Menu) => {
    for (const property of Object.getOwnPropertyNames(menu)) {
      expect(menu).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: IMenuRepository;

  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);

    testMenu = await menuRepository.findOne({});
  });

  it("should get a menu", async () => {
    const menu = (await getMenu({ menuRepository })(testMenu.id, false)) as Menu;

    expectResponseToHaveKeys(menu);

    expect(menu).toBeDefined();
    expect(menu).toEqual(testMenu);
  });

  it("should get a menu (formatted)", async () => {
    const menu = (await getMenu({ menuRepository })(testMenu.id, true)) as FormattedMenuResponse;

    expect(menu).toBeTruthy();
    expect(menu.name).toEqual(testMenu.name);
    expect(menu.categories).toBeDefined();
    expect(menu.status).toBeDefined();
  });

  it("should fail to get a menu (by throwing a NotFoundError)", async () => {
    await expect(async () => getMenu({ menuRepository })(-1, false)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
