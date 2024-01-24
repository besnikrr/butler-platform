import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Label, { ILabel } from "../../entities/label";
import deleteLabel from "../delete-label";
import { MenuEntities } from "../../../entities";
import { ILabelRepository } from "../../repository";
import Product from "../../../product/entities/product";
import { IProductRepository } from "../../../product/repository";

describe("Delete label usecase", () => {
  let orm: MikroORM;
  let labelRepository: ILabelRepository;
  let productRepository: IProductRepository;
  let labelToDelete: ILabel;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    labelRepository = conn.em.getRepository(Label);
    productRepository = conn.em.getRepository(Product);
    labelToDelete = await labelRepository.findOne({});
  });

  it("should delete a label", async () => {
    const deleted = await deleteLabel({ labelRepository, productRepository })(labelToDelete.id);

    expect(deleted).toBeTruthy();
    expect(deleted).toHaveProperty("deleted_at");
    expect(deleted.deleted_at).toBeTruthy();
  });

  it("should fail to delete a label", async () => {
    await expect(async () => deleteLabel({ labelRepository, productRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
