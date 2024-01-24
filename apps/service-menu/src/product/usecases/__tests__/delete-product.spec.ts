import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IProductMenuRepository } from "../../../menu/repository";
import { MenuEntities } from "../../../entities";
import Product from "../../entities/product";
import { IProductRepository } from "../../repository";
import deleteProduct from "../delete-product";
import ProductMenu from "@services/service-menu/src/menu/entities/product-menu";

describe("Delete product usecase", () => {
  let orm: MikroORM;
  let productRepository: IProductRepository;
  let productMenuRepository: IProductMenuRepository;
  let productToDelete: Product;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    productRepository = conn.em.getRepository(Product);
    productMenuRepository = conn.em.getRepository(ProductMenu);
    productToDelete = await productRepository.findOne({});
  });

  it("Should delete a product and its relations", async () => {
    const deleted = await deleteProduct({ productRepository, productMenuRepository })(productToDelete.id);
    const deletedProduct = await productRepository.findOne(
      { id: productToDelete.id },
      { filters: { excludeDeleted: { isDeleted: true } }, populate: ["modifiers", "categories", "productItems"] }
    );

    expect(deleted).toEqual(true);
    expect(deletedProduct).toHaveProperty("deleted_at");
    expect(deletedProduct.deleted_at).toBeTruthy();
    expect(deletedProduct.modifiers.getItems()).toEqual([]);
    expect(deletedProduct.categories.getItems()).toEqual([]);
  });

  it("should fail to delete a product", async () => {
    await expect(async () => deleteProduct({
      productMenuRepository,
      productRepository
    })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
