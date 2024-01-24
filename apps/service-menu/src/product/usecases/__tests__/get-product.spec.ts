
import {
  getTestConnection, NotFoundError, seedDatabase, clearDatabase
} from "@butlerhospitality/service-sdk";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Product from "../../entities/product";
import getProduct from "../get-product";
import { MenuEntities } from "../../../entities";
import { IProductRepository } from "../../repository";

describe("Get product usecase", () => {
  const expectResponseToHaveKeys = (product: Product) => {
    for (const property of Object.getOwnPropertyNames(product)) {
      expect(product).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let productRepository: IProductRepository;
  let existingProduct: Product;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    productRepository = conn.em.getRepository(Product);
    existingProduct = await productRepository.findOne({});
  });

  it("should get a product", async () => {
    const product = await getProduct({ productRepository })(existingProduct.id);

    expectResponseToHaveKeys(product);
    expect(product.id).toBeGreaterThan(0);
    expect(product.name).toEqual(existingProduct.name);
    expect(product.description).toEqual(existingProduct.description);
    expect(product.needs_cutlery).toEqual(existingProduct.needs_cutlery);
    expect(product.guest_view).toEqual(existingProduct.guest_view);
    expect(product.raw_food).toEqual(existingProduct.raw_food);
    expect(product.modifiers.getItems().map((item) => ({ name: item.name, id: item.id }))).toEqual(
      existingProduct.modifiers.getItems().map((item) => ({ name: item.name, id: item.id }))
    );
    expect(product.categories.getItems().map((item) => ({ name: item.name, id: item.id }))).toEqual(
      existingProduct.categories.getItems().map((item) => ({ name: item.name, id: item.id }))
    );
    expect(product.out_of_stock.getItems().map((item) => ({
      hub_id: item.hub_id,
      product_id: item.product_id,
      id: item.id
    }))).toEqual(
      existingProduct.out_of_stock.getItems().map((item) => ({
        hub_id: item.hub_id,
        product_id: item.product_id,
        id: item.id
      }))
    );
  });

  it("should fail to get a product", async () => {
    await expect(async () => getProduct({ productRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
