
import {
  clearDatabase, CustomEntityRepository, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import listMenu from "../list-menu";
import Menu from "../../entities/menu";
import { MenuEntities } from "../../../entities";

describe("Use case - List menus", () => {
  const expectResponseToHaveKeys = (menu: Menu) => {
    for (const property of Object.getOwnPropertyNames(menu)) {
      expect(menu).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: CustomEntityRepository<Menu>;
  let searchMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);

    searchMenu = await menuRepository.findOne({});
  });

  it("should list menus", async () => {
    const [menus, count] = await listMenu({ menuRepository })({ page: 1, limit: 10 });

    for (const menu of menus) {
      expectResponseToHaveKeys(menu);
    }

    expect(count).toBeGreaterThan(0);
    expect(menus.length).toBeGreaterThan(0);
    expect(menus.length).toBeLessThanOrEqual(10);
  });

  it("should list menus by name", async () => {
    const [menus, count] = await listMenu({ menuRepository })({ page: 1, limit: 10, name: searchMenu.name });

    for (const menu of menus) {
      expectResponseToHaveKeys(menu);
    }

    expect(count).toBeGreaterThan(0);
    expect(menus.length).toBeGreaterThan(0);

    expect(menus.every((menu) => menu.name.toLowerCase().includes(searchMenu.name.toLowerCase())));
  });

  it("should list menus by hotel ids", async () => {
    const [menus, count] = await listMenu({ menuRepository })({ page: 1, limit: 10, hotelIds: [1, 2, 3] });

    for (const menu of menus) {
      expectResponseToHaveKeys(menu);
    }

    expect(count).toBeGreaterThan(0);
    expect(menus.length).toBeGreaterThan(0);
  });

  it("should return no menus", async () => {
    const [menus, count] = await listMenu({ menuRepository })({ page: 1, limit: 10, name: "NON_EXISTENT_MENU" });

    expect(count).toEqual(0);
    expect(menus.length).toEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
