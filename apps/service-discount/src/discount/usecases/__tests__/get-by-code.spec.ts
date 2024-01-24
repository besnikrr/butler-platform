import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import {
  seedDatabase,
  clearDatabase,
  getTestConnection,
  NotFoundError
} from "@butlerhospitality/service-sdk";
import { IDiscountRepository } from "../../repository";
import Discount from "../../entities/discount";
import entities from "../../../utils/entities";
import getByCode from "../get-by-code";

describe("Usecase - Get discount by code", () => {
  let orm: MikroORM;
  let discountRepository: IDiscountRepository;
  let existingDiscount: Discount;

  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, entities);
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));

    discountRepository = orm.em.getRepository(Discount);
    existingDiscount = await discountRepository.findOne({});
  });

  it("should get discount by code", async () => {
    const discount = await getByCode({ discountRepository })(existingDiscount.code);

    expectResponseToHaveKeys(discount);
    expect(discount).toEqual(discount);
  });

  it("should fail to get a discount by code", async () => {
    await expect(async () => getByCode({ discountRepository })(
      "NON-EXISTENT-CODE"
    )).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  const expectResponseToHaveKeys = (discount: Discount) => {
    for (const property of Object.getOwnPropertyNames(discount)) {
      expect(discount).toHaveProperty(property);
    }
  };
});
