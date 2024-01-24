import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import getHotel from "../get-hotel";
import Hotel from "../../entities/hotel";
import { HotelRepository } from "../../repository";

describe("get single hotel", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    hotelRepository = orm.em.getRepository(Hotel);
  });

  beforeEach(async () => {
    orm.em.clear();
  });

  it("should get single hotel only by id", async () => {
    const hotelId = 2;
    const hotel = await getHotel({ hotelRepository })(hotelId);
    expect(hotel).toBeDefined();
  });

  it("should throw not found error", async () => {
    await expect(async () => {
      await getHotel({ hotelRepository })(-1);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
