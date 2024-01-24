
import { ForeignKeyConstraintViolationException, MikroORM } from "@mikro-orm/core";
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import { IProductRepository } from "../../../product/repository";
import { ICategoryRepository } from "../../../category/repository";
import createMenu, { ICreateMenuInput, IPartialProduct } from "../create-menu";
import Menu, { MENU_STATUS } from "../../entities/menu";
import Category from "../../../category/entities/category";
import Product from "../../../product/entities/product";
import { IMenuRepository, IProductMenuRepository } from "../../repository";
import ProductMenu from "../../entities/product-menu";
import { MenuEntities } from "../../../entities";

describe("Use case - Create menu", () => {
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

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    productRepository = orm.em.getRepository(Product);
    categoryRepository = orm.em.getRepository(Category);
    productMenuRepository = orm.em.getRepository(ProductMenu);
  });

  it("should create a menu", async () => {
    const products: IPartialProduct[] = [];

    for (let i = 1; i < 5; i += 1) {
      products.push({
        product_id: i,
        category_id: faker.datatype.number({
          min: 1,
          max: 5
        }),
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

    const data: ICreateMenuInput = {
      name: faker.random.word(),
      products
    };

    const menu = await createMenu({
      menuRepository, productRepository, categoryRepository, productMenuRepository
    })(data);

    expectResponseToHaveKeys(menu);

    expect(menu.id).toBeGreaterThan(0);
    expect(menu.name).toEqual(data.name);
    expect(menu.status).toEqual(MENU_STATUS.INACTIVE);

    expect(
      menu.products.getItems().map((item) => ({
        product_id: item.product.id,
        category_id: item.category.id,
        price: item.price,
        is_favorite: item.is_favorite,
        is_popular: item.is_popular,
        suggested_items: item.suggested_items
      }))
    ).toEqual(data.products);
  });

  it("should fail to create a menu (by throwing a ForeignKeyConstraintViolationException)", async () => {
    const products: IPartialProduct[] = [];

    for (let i = 1; i < 5; i += 1) {
      products.push({
        product_id: -i,
        category_id: -i,
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

    const data: ICreateMenuInput = {
      name: faker.random.alpha(100),
      products
    };

    await expect(() => createMenu({
      menuRepository, productRepository, categoryRepository, productMenuRepository
    })(data)).rejects.toThrow(
      ForeignKeyConstraintViolationException
    );
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
