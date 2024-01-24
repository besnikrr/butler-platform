import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import getHotels from "../get-list-hotels";
import Hotel from "../../entities/hotel";
import { IHotelRepository } from "../../repository";
import { IHotelFilter } from "../get-list-hotels";

describe("get multiple hotels", () => {
  let orm: MikroORM;
  let hotelRepository: IHotelRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    hotelRepository = orm.em.getRepository(Hotel);
  });

  it("should get multiple hotels", async () => {
    const filters: IHotelFilter = {
      limit: 10,
      page: 1
    };
    const hotels = await getHotels({ hotelRepository })(filters);
    expect(hotels.length).toBeTruthy();
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
