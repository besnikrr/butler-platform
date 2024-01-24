
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import duplicateMenu from "../duplicate-menu";
import { IMenuRepository, IProductMenuRepository } from "../../repository";
import Menu, { MENU_STATUS } from "../../entities/menu";
import ProductMenu from "../../entities/product-menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Duplicate menu", () => {
  const expectResponseToHaveKeys = (menu: Menu) => {
    for (const property of Object.getOwnPropertyNames(menu)) {
      expect(menu).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: IMenuRepository;
  let productMenuRepository: IProductMenuRepository;

  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    productMenuRepository = orm.em.getRepository(ProductMenu);

    testMenu = await menuRepository.findOne({});
  });

  it("should duplicate a menu", async () => {
    const duplicatedMenu = await duplicateMenu({ menuRepository, productMenuRepository })(testMenu.id);

    expectResponseToHaveKeys(duplicatedMenu);

    expect(duplicatedMenu.id).toBeGreaterThan(0);
    expect(duplicatedMenu.name).toStrictEqual(`${testMenu.name} Copy`);
    expect(duplicatedMenu.status).toStrictEqual(MENU_STATUS.INACTIVE);
    expect(duplicatedMenu.products.length).toEqual(testMenu.products.length);

    expect(
      duplicatedMenu.products.getItems().map((item) => ({
        product: item.product,
        category: item.category,
        price: item.price,
        is_favorite: item.is_favorite,
        is_popular: item.is_popular,
        suggested_items: item.suggested_items
      }))
    ).toEqual(
      testMenu.products.getItems().map((item) => ({
        product: item.product,
        category: item.category,
        price: item.price,
        is_favorite: item.is_favorite,
        is_popular: item.is_popular,
        suggested_items: item.suggested_items
      }))
    );
    expect(duplicatedMenu.hotels).toBeDefined();
    expect(duplicatedMenu.hotels.length).toEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
