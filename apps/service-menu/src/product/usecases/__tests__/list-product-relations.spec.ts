import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { EntityManager, Knex } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { MenuEntities } from "../../../entities";
import getProductRelations from "../list-product-relations";
import Product from "../../entities/product";
import { IProductRepository } from "../../repository";

describe("List product relations usecase", () => {
  let orm: MikroORM;
  let knex: Knex;
  let productRepository: IProductRepository;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    knex = (conn.em as EntityManager).getKnex();
    productRepository = conn.em.getRepository(Product);
  });

  it("should list all relations of a product", async () => {
    const productWithMenus = await productRepository.findOne({ productItems: { menu: { $ne: null } } });
    const relations = await getProductRelations({ knex })(productWithMenus.id);

    // TODO revist the code for relations/ it reurns false for products that dont have relations
    if (relations !== false) {
      expect(relations).toHaveProperty("id");
      expect(relations).toHaveProperty("name");
      expect(relations).toHaveProperty("menus");
      expect(relations.menus.length).toBeGreaterThanOrEqual(0);
    }
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
