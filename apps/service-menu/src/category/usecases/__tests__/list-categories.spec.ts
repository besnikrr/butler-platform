
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Category from "../../entities/category";
import listCategories, { CategoryType } from "../list-categories";
import { MenuEntities } from "../../../entities";
import { ICategoryRepository } from "../../repository";

describe("List categories usecase", () => {
  const expectResponseToHaveKeys = (category: Category) => {
    for (const property of Object.getOwnPropertyNames(category)) {
      expect(category).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let categoryToSearch: Category;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);
    categoryToSearch = await categoryRepository.findOne({});
  });

  it("should list categories", async () => {
    const [categories, count] = await listCategories({ categoryRepository })({ page: 1, limit: 10 });
    categories.map((category) => expectResponseToHaveKeys(category));
    expect(count).toBeGreaterThan(0);
  });

  it("should list categories grouped with subcategories", async () => {
    const [categories, count] = await listCategories({ categoryRepository })({ page: 1, limit: 10, grouped: true });

    categories.map((category) => expectResponseToHaveKeys(category));
    expect(count).toBeGreaterThan(0);
  });

  it("should list categories filtered by type(category)", async () => {
    const [categories, count] = await listCategories({
      categoryRepository
    })({
      page: 1,
      limit: 10,
      type: [CategoryType.category]
    });

    categories.forEach((category) => {
      expectResponseToHaveKeys(category);
      expect(category.parent_category_id).toEqual(null);
    });
    expect(count).toBeGreaterThan(0);
  });

  it("should list categories filtered by type(subcategory)", async () => {
    const [categories, count] = await listCategories({
      categoryRepository
    })({
      page: 1,
      limit: 10,
      type: [CategoryType.subcategory]
    });

    categories.forEach((category) => {
      expectResponseToHaveKeys(category);
      expect(category.parent_category_id).not.toEqual(null);
    });
    expect(count).toBeGreaterThan(0);
  });

  it("should list categories filtered by name", async () => {
    const [categories, count] = await listCategories({
      categoryRepository
    })({
      page: 1,
      limit: 10,
      name: categoryToSearch.name
    });

    categories.forEach((category) => {
      expectResponseToHaveKeys(category);
      expect(category.name).toContain(categoryToSearch.name);
    });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
