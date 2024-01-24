
import {
  BadRequestError, clearDatabase, ConflictError, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { faker } from "@faker-js/faker";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Category from "../../entities/category";
import createCategory, { ICreateCategoryInput } from "../create-category";
import { ICategoryRepository } from "../../repository";
import { MenuEntities } from "../../../entities";

describe("Create category/subcategory usecase", () => {
  const expectResponseToHaveKeys = (category: Category) => {
    for (const property of Object.getOwnPropertyNames(category)) {
      expect(category).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let createdCategory: Category;
  let createdSubcategory: Category;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);

    // logger.log('connection-debug: ', conn);
    // logger.log('categoryRepository-debug: ', categoryRepository);
  });

  it("should create a category", async () => {
    const data: ICreateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future()
    };

    const category = await createCategory({ categoryRepository })(data);
    createdCategory = category;

    expectResponseToHaveKeys(category);
    expect(category.id).toBeGreaterThan(0);
    expect(category.name).toEqual(data.name);
    expect(category.start_date).toEqual(data.start_date);
    expect(category.end_date).toEqual(data.end_date);
  });

  it("should create a subcategory", async () => {
    const data: ICreateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      parent_category_id: createdCategory.id
    };

    const category = await createCategory({ categoryRepository })(data);
    createdSubcategory = category;

    expectResponseToHaveKeys(category);
    expect(category.id).toBeGreaterThan(0);
    expect(category.name).toEqual(data.name);
    expect(category.start_date).toEqual(data.start_date);
    expect(category.end_date).toEqual(data.end_date);
    expect(category.parent_category_id).toEqual(data.parent_category_id);
  });

  it("should fail to create a subcategory with a subcategory as a parent", async () => {
    const data: ICreateCategoryInput = {
      name: faker.commerce.productName(),
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      parent_category_id: createdSubcategory.id
    };

    await expect(async () => createCategory({ categoryRepository })(data)).rejects.toThrow(BadRequestError);
  });

  it("should fail to create a category that already exists", async () => {
    const data: ICreateCategoryInput = {
      name: createdCategory.name,
      start_date: faker.date.recent(),
      end_date: faker.date.future()
    };

    await expect(async () => createCategory({ categoryRepository })(data)).rejects.toThrow(ConflictError);
  });

  it("should fail to create a subcategory that already exists", async () => {
    const data: ICreateCategoryInput = {
      name: createdSubcategory.name,
      start_date: faker.date.recent(),
      end_date: faker.date.future(),
      parent_category_id: createdSubcategory.parent_category_id
    };

    await expect(async () => createCategory({ categoryRepository })(data)).rejects.toThrow(ConflictError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
