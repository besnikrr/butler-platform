
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { ICategoryRepository } from "../../../category/repository";
import Product from "../../entities/product";
import listProducts from "../list-products";
import { MenuEntities } from "../../../entities";
import Category from "../../../category/entities/category";
import { IProductRepository } from "../../repository";

describe("List products usecase", () => {
  const expectResponseToHaveKeys = (product: Product) => {
    for (const property of Object.getOwnPropertyNames(product)) {
      expect(product).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let productRepository: IProductRepository;
  let productToSearch: Product;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);
    productRepository = conn.em.getRepository(Product);
    productToSearch = await productRepository.findOne({});
  });

  it("should list products", async () => {
    const [products, count] = (await listProducts({
      productRepository,
      categoryRepository
    })({
      page: 1,
      limit: 10
    })) as [
      Product[],
      number,
    ];
    products.map((product) => expectResponseToHaveKeys(product));
    expect(count).toBeGreaterThan(0);
  });

  it("should list products, categorized", async () => {
    const [categories, count] = await listProducts({
      productRepository,
      categoryRepository
    })({
      page: 1,
      limit: 10,
      categorized: true
    });

    categories.map((category) => expect(Object.keys(category.subcategories.items).length).toBeGreaterThanOrEqual(0));
    expect(count).toBeGreaterThan(0);
  });

  it("should list products filtered by name", async () => {
    const [products, count] = (await listProducts({ productRepository, categoryRepository })({
      page: 1,
      limit: 10,
      name: productToSearch.name
    })) as [Product[], number];

    products.forEach((product: Product) => {
      expectResponseToHaveKeys(product);
      expect(product.name).toContain(productToSearch.name);
    });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
