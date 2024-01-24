
import { MikroORM } from "@mikro-orm/core";
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import Product from "../../../product/entities/product";
import Category from "../../../category/entities/category";
import updateMenu, { IUpdateMenuInput } from "../update-menu";
import { IPartialProduct } from "../create-menu";
import Menu from "../../entities/menu";
import ProductMenu from "../../entities/product-menu";
import { IMenuRepository, IProductMenuRepository } from "../../repository";
import { IProductRepository } from "../../../product/repository";
import { ICategoryRepository } from "../../../category/repository";
import { MenuEntities } from "../../../entities";

describe("Use case - Update menu", () => {
  const expectResponseToHaveKeys = (menu: Menu) => {
    for (const property of Object.getOwnPropertyNames(menu)) {
      expect(menu).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: IMenuRepository;
  let productRepository: IProductRepository;
  let categoryRepository: ICategoryRepository;
  let productMenuRepository: IProductMenuRepository;

  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    productRepository = orm.em.getRepository(Product);
    categoryRepository = orm.em.getRepository(Category);
    productMenuRepository = orm.em.getRepository(ProductMenu);

    testMenu = await menuRepository.findOne({});
  });

  it("should update a menu", async () => {
    const menu = await menuRepository.findOne(testMenu.id);
    const productsToUpdate: IPartialProduct[] = [];
    for (let i = 1; i < 5; i += 1) {
      productsToUpdate.push({
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

    const data: IUpdateMenuInput = {
      name: faker.random.alpha(100),
      products: productsToUpdate
    };

    const updatedMenu = await updateMenu({
      menuRepository, productRepository, categoryRepository, productMenuRepository
    })(
      testMenu.id,
      data
    );

    expectResponseToHaveKeys(updatedMenu);

    expect(menu.id).toBeGreaterThan(0);
    expect(menu.name).toEqual(updatedMenu.name);
    expect(menu.status).toEqual(updatedMenu.status);

    expect(
      menu.products.getItems().map((item) => ({
        product_id: item.product.id,
        category_id: item.category.id,
        price: item.price,
        is_favorite: item.is_favorite,
        is_popular: item.is_popular,
        suggested_items: item.suggested_items
      }))
    ).toEqual(
      updatedMenu.products.getItems().map((item) => ({
        product_id: item.product.id,
        category_id: item.category.id,
        price: item.price,
        is_favorite: item.is_favorite,
        is_popular: item.is_popular,
        suggested_items: item.suggested_items
      }))
    );
  });

  it("should fail to update a menu (by throwing a NotFoundError)", async () => {
    const data: IUpdateMenuInput = {
      name: faker.random.word(),
      products: []
    };

    await expect(async () => updateMenu({
      menuRepository, productRepository, categoryRepository, productMenuRepository
    })(-1, data)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
