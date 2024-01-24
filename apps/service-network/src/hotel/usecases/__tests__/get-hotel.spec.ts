import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import Hotel from "../../entity";
import getHotel from "../get-hotel";
import { HotelRepository } from "../../repository";

describe("get hotel", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;
  let testHotel: Hotel;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;
    hotelRepository = orm.em.getRepository(Hotel);
    testHotel = await hotelRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should get one hotel", async () => {
    const payload = await getHotel({ hotelRepository })(1);
    expect(payload).toEqual(testHotel);
  });

  it("should throw not found if hotel with given id does not exits", async () => {
    const invalidId = -1;
    await expect(async () => {
      await getHotel({ hotelRepository })(invalidId);
    }).rejects.toThrowError(NotFoundError);
  });
});
