
import { MikroORM } from "@mikro-orm/core";
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import batchUpdateMenus, { IBatchUpdateMenuInput } from "../batch-update-menus";
import Menu from "../../entities/menu";
import { IPartialProduct } from "../create-menu";
import Product from "../../../product/entities/product";
import Category from "../../../category/entities/category";
import { ICategoryRepository } from "../../../category/repository";
import { IMenuRepository, IProductMenuRepository } from "../../repository";
import { IProductRepository } from "../../../product/repository";
import ProductMenu from "../../entities/product-menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Batch update menus", () => {
  let orm: MikroORM;
  let menuRepository: IMenuRepository;
  let productRepository: IProductRepository;
  let categoryRepository: ICategoryRepository;
  let productMenuRepository: IProductMenuRepository;

  let testMenus: Menu[];
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    productRepository = orm.em.getRepository(Product);
    categoryRepository = orm.em.getRepository(Category);
    productMenuRepository = orm.em.getRepository(ProductMenu);

    testMenus = await menuRepository.findAll();
  });

  it("should batch update menus", async () => {
    const products: IPartialProduct[] = [];
    const menuIds = testMenus.map((menu) => menu.id);

    for (let i = 1; i < 5; i += 1) {
      products.push({
        product_id: i,
        category_id: 1,
        price: faker.datatype.float({
          min: 1,
          max: 50,
          precision: 0.01
        }),
        is_favorite: faker.datatype.boolean(),
        is_popular: faker.datatype.boolean(),
        suggested_items: Array.from({ length: 5 }, () => faker.datatype.number(100))
      });
    }

    const input: IBatchUpdateMenuInput = {
      menu_ids: menuIds,
      products
    };

    await batchUpdateMenus({ menuRepository, productRepository, categoryRepository, productMenuRepository })(input);

    const updatedMenus = await menuRepository.getEntitiesOrFailIfNotFound(menuIds, ["products"]);

    for (const updatedMenu of updatedMenus) {
      for (const product of products) {
        expect(
          updatedMenu.products
            .getItems()
            .some((a) => a.product.id === product.product_id &&
            a.menu.id === updatedMenu.id && a.category.id === product.category_id)
        ).toEqual(true);
      }
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
