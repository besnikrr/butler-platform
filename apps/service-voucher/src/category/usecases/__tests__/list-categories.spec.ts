import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import getGrouped from "../list-categories";
import Category from "../../entities/category";
import { ICategoryRepository } from "../../repository";

describe("get multiple categories", () => {
  let orm: MikroORM;
  let categoryRepository: ICategoryRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    categoryRepository = orm.em.getRepository(Category);
  });

  it("should return categories", async () => {
    const [result] = await getGrouped({ categoryRepository })();
    expect(result.length).toBeTruthy();
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
