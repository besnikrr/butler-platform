import { MikroORM } from "@mikro-orm/core";
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import * as path from "path";
import deleteMenu from "../delete-menu";
import { IMenuRepository, IProductMenuRepository } from "../../repository";
import Menu from "../../entities/menu";
import ProductMenu from "../../entities/product-menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Delete menu", () => {
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

  it("should delete a menu", async () => {
	  await deleteMenu({ menuRepository, productMenuRepository })(testMenu.id);

    const deletedMenu = await menuRepository.findOne(
      { id: testMenu.id },
      { filters: { excludeDeleted: { isDeleted: true } }, populate: ["products", "hotels"] }
    );

    expect(deletedMenu).toHaveProperty("deleted_at");
    expect(deletedMenu.deleted_at).toBeTruthy();
    expect(deletedMenu.products.length).toEqual(0);
    expect(deletedMenu.hotels.length).toEqual(0);
  });

  it("should fail to delete a menu (by throwing a NotFoundError)", async () => {
    await expect(async () => deleteMenu({ menuRepository, productMenuRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
