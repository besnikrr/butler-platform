import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Category from "../../entities/category";
import deleteCategory from "../delete-category";
import { MenuEntities } from "../../../entities";
import { ICategoryRepository } from "../../repository";

describe("Delete category usecase", () => {
  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  let categoryToDelete: Category;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = conn.em.getRepository(Category);
    categoryToDelete = await categoryRepository.findOne({});
  });

  it("should delete a category", async () => {
    await deleteCategory({ categoryRepository })(categoryToDelete.id);

    const deletedCategory = await categoryRepository.findOne(
      { id: categoryToDelete.id },
      { filters: { excludeDeleted: { isDeleted: true } }, populate: ["subcategories"] }
    );

    expect(deletedCategory).toHaveProperty("deleted_at");
    expect(deletedCategory.deleted_at).toBeTruthy();
  });

  it("should fail to delete a category", async () => {
    await expect(async () => deleteCategory({ categoryRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
