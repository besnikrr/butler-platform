
import {
  getTestConnection, seedDatabase, clearDatabase
} from "@butlerhospitality/service-sdk";
import { ForeignKeyConstraintViolationException, MikroORM } from "@mikro-orm/core";
import { faker } from "@faker-js/faker";
import * as path from "path";
import Hub from "../../../hub/entities/hub";
import { MenuEntities } from "../../../entities";

import takeProductOutOfStock, { IOutOfStockInput } from "../take-product-out-of-stock";
import Product from "../../entities/product";
import OutOfStock from "../../entities/out-of-stock";
import { IOutOfStockRepository, IProductRepository } from "../../repository";
import { IHubRepository } from "../../../hub/repository";

describe("Take product out of stock usecase", () => {
  const expectResponseToHaveKeys = (outOfStock: OutOfStock) => {
    for (const property of Object.getOwnPropertyNames(outOfStock)) {
      expect(outOfStock).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let productRepository: IProductRepository;
  let outOfStockRepository: IOutOfStockRepository;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    hubRepository = conn.em.getRepository(Hub);
    productRepository = conn.em.getRepository(Product);
    outOfStockRepository = conn.em.getRepository(OutOfStock);
  });

  it("Should take products out of stock", async () => {
    const { id: hubId } = await hubRepository.findOne({});
    const { id: prodId } = await productRepository.findOne({});
    const data: IOutOfStockInput = {
      hubs: [
        {
          hub_id: hubId,
          hours: faker.datatype.number(24),
          days: faker.datatype.number(365)
        }
      ]
    };

    const outOfStock = await takeProductOutOfStock({ hubRepository, outOfStockRepository })(prodId, data);

    outOfStock.map((oof) => expectResponseToHaveKeys(oof));
    expect(outOfStock.map((oof) => ({ hub_id: oof.hub_id, product_id: oof.product_id }))).toEqual(
      data.hubs.map(() => ({ hub_id: hubId, product_id: prodId }))
    );
  });

  it("Should fail to take products out of stock", async () => {
    const { id: hubId } = await hubRepository.findOne({});
    const data: IOutOfStockInput = {
      hubs: [
        {
          hub_id: hubId,
          hours: faker.datatype.number(24),
          days: faker.datatype.number(365)
        }
      ]
    };

    await expect(async () => takeProductOutOfStock({
      hubRepository,
      outOfStockRepository
    })(-1, data)).rejects.toThrow(ForeignKeyConstraintViolationException);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
