
import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Category from "../../entities/category";
import getCategory from "../get-category";
import { MenuEntities } from "../../../entities";
import { ICategoryRepository } from "../../repository";

describe("Get category usecase", () => {
  const expectResponseToHaveKeys = (category: Category) => {
    for (const property of Object.getOwnPropertyNames(category)) {
      expect(category).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let testCategory: Category;
  let testSubcategory: Category;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);
    testCategory = await categoryRepository.findOne({ parent_category_id: null });
    testSubcategory = await categoryRepository.findOne({ parent_category_id: { $ne: null } });
  });

  it("should get a category", async () => {
    const category = await getCategory({ categoryRepository })(testCategory.id);

    expectResponseToHaveKeys(category);
    expect(category).toEqual(testCategory);
  });

  it("should get a subcategory", async () => {
    const category = await getCategory({ categoryRepository })(testSubcategory.id);

    expectResponseToHaveKeys(category);
    expect(category).toEqual(testSubcategory);
  });

  it("should fail to get a category", async () => {
    await expect(async () => getCategory({ categoryRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
