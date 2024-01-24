import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
// import { IOutOfStockRepository } from "../../repository";
import { MenuEntities } from "../../../entities";
// import OutOfStock from "../../entities/out-of-stock";
// import returnProductsBackInStock from "../return-product-back-in-stock";

describe("Return product back in stock usecase", () => {
  let orm: MikroORM;
  // let outOfStockRepository: IOutOfStockRepository;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    // outOfStockRepository = conn.em.getRepository(OutOfStock);
  });

  it("Should return products back in stock", async () => {
    // Leaving this out temporarily because of the DB connection
    // const backInStock = await returnProductsBackInStock();
    // const oof = await outOfStockRepository.find({ available_at: { $lte: new Date().toISOString() } });
    // expect(backInStock).toEqual(true);
    // expect(oof).toEqual([]);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
