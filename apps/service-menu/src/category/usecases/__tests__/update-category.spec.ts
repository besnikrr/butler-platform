
import {
  BadRequestError, clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { faker } from "@faker-js/faker";
import * as path from "path";
import Category from "../../entities/category";
import updateCategory, { IUpdateCategoryInput } from "../update-category";
import { MenuEntities } from "../../../entities";
import { ICategoryRepository } from "../../repository";

describe("Create category/subcategory usecase", () => {
  const expectResponseToHaveKeys = (category: Category) => {
    for (const property of Object.getOwnPropertyNames(category)) {
      expect(category).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let categoryToUpdate: Category;
  let subcategoryToUpdate: Category;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);
    categoryToUpdate = await categoryRepository.findOne({ parent_category_id: null });
    subcategoryToUpdate = await categoryRepository.findOne({ parent_category_id: { $ne: null } });
  });

  it("should update a category", async () => {
    const data: IUpdateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future()
    };

    const category = await updateCategory({ categoryRepository })(categoryToUpdate.id, data);

    expectResponseToHaveKeys(category);
    expect(category.id).toBeGreaterThan(0);
    expect(category.name).toEqual(data.name);
    expect(category.start_date).toEqual(data.start_date);
    expect(category.end_date).toEqual(data.end_date);
  });

  it("should fail to update the category when parent_category_id provided", async () => {
    const data: IUpdateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      parent_category_id: 1
    };

    await expect(async () => updateCategory({
      categoryRepository
    })(categoryToUpdate.id, data)).rejects.toThrow(BadRequestError);
  });

  it("should fail to update a subcategory if parent category provided does not exist", async () => {
    const data: IUpdateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      parent_category_id: -1
    };

    await expect(async () => updateCategory({
      categoryRepository
    })(subcategoryToUpdate.id, data)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
