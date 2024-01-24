
import { getTestConnection, clearDatabase, seedDatabase } from "@butlerhospitality/service-sdk";
import { EntityManager } from "@mikro-orm/postgresql";
import { Knex } from "@mikro-orm/knex";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { MenuEntities } from "../../../entities";
import getCategoryRelations from "../list-category-relations";
import Category from "../../entities/category";
import { ICategoryRepository } from "../../repository";

describe("List category relations usecase", () => {
  let knex: Knex;
  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    knex = (conn.em as EntityManager).getKnex();
    categoryRepository = conn.em.getRepository(Category);
  });

  it("should list subcategories related to the category", async () => {
    const categoryWithSubcategories = await categoryRepository.findOne({ subcategories: { $ne: null } });
    const relations = await getCategoryRelations({ knex })(categoryWithSubcategories.id);

    expect(relations).toHaveProperty("items");
    expect(relations).toHaveProperty("menus");
    expect(relations).toHaveProperty("parent_categories");
    expect(relations).toHaveProperty("subcategories");
    expect(relations.subcategories.length).toBeGreaterThan(0);
  });

  it("should list menus related to the category", async () => {
    const categoryWithSubcategories = await categoryRepository.findOne({ menuProducts: { menu: { $ne: null } } });
    const relations = await getCategoryRelations({ knex })(categoryWithSubcategories.id);

    expect(relations).toHaveProperty("items");
    expect(relations).toHaveProperty("menus");
    expect(relations).toHaveProperty("parent_categories");
    expect(relations).toHaveProperty("subcategories");
    expect(relations.menus.length).toBeGreaterThan(0);
  });

  it("should list items related to the category", async () => {
    const categoryWithSubcategories = await categoryRepository.findOne({ items: { $ne: null } });
    const relations = await getCategoryRelations({ knex })(categoryWithSubcategories.id);

    expect(relations).toHaveProperty("items");
    expect(relations).toHaveProperty("menus");
    expect(relations).toHaveProperty("parent_categories");
    expect(relations).toHaveProperty("subcategories");
    expect(relations.items.length).toBeGreaterThan(0);
  });

  it("should list parent categories related to the category", async () => {
    const categoryWithSubcategories = await categoryRepository.findOne({ parent_category_id: { $ne: null } });
    const relations = await getCategoryRelations({ knex })(categoryWithSubcategories.id);

    expect(relations).toHaveProperty("items");
    expect(relations).toHaveProperty("menus");
    expect(relations).toHaveProperty("parent_categories");
    expect(relations).toHaveProperty("subcategories");
    expect(relations.parent_categories.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
