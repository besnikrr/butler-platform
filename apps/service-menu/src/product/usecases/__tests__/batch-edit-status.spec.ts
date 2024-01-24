
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { MenuEntities } from "../../../entities";
import Product from "../../entities/product";
import batchEditProductStatus, { IBatchEditProductStatusInput } from "../batch-edit-status";
import getProductRelations from "../list-product-relations";
import { IProductRepository } from "../../repository";
import { IProductMenuRepository } from "../../../menu/repository";
import { EntityManager, Knex } from "@mikro-orm/postgresql";
import ProductMenu from "@services/service-menu/src/menu/entities/product-menu";

describe("create product", () => {
  let orm: MikroORM;
  let knex: Knex;
  let productRepository: IProductRepository;
  let productMenuRepository: IProductMenuRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    knex = (orm.em as EntityManager).getKnex();
    productRepository = orm.em.getRepository(Product);
    productMenuRepository = orm.em.getRepository(ProductMenu);
  });

  const validateProducts = async (products: Product[], active: boolean) => {
    for (const product of products) {
      expect(product.is_active).toBe(active);
      if (!active) {
        const relations = await getProductRelations({ knex })(product.id);
        expect(relations).toBe(active);
      }
    }
  };

  it("should activate multiple products", async () => {
    const productData: IBatchEditProductStatusInput = {
      is_active: true,
      ids: [4, 5, 6]
    };
    const products = await batchEditProductStatus({ productRepository })(productData);
    const requestedProducts = await productRepository.find({ id: productData.ids });
    expect(products).toBeDefined();
    expect(products.length).toBe(requestedProducts.length);
    validateProducts(products, productData.is_active);
  });

  it("should deactivate multiple products and remove products from all menus", async () => {
    const productData: IBatchEditProductStatusInput = {
      is_active: false,
      ids: [5, 6, 7]
    };
    const products = await batchEditProductStatus({ productRepository, productMenuRepository })(productData);
    const requestedProducts = await productRepository.find({ id: productData.ids });
    expect(products).toBeDefined();
    expect(products.length).toBe(requestedProducts.length);
    validateProducts(products, productData.is_active);
  });

  it("should activate multiple products and return only existing products", async () => {
    const productData: IBatchEditProductStatusInput = {
      is_active: true,
      ids: [5, 6, 99]
    };
    const products = await batchEditProductStatus({ productRepository })(productData);
    const requestedProducts = await productRepository.find({ id: productData.ids });
    expect(products).toBeDefined();
    expect(products.length).toBe(requestedProducts.length);
    validateProducts(products, productData.is_active);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
