import {
  clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import Hotel from "../../entity";
import deleteHotel from "../delete-hotel";
import { HotelRepository } from "../../repository";

describe("delete hotel", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;

    hotelRepository = orm.em.getRepository(Hotel);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should delete the hotel", async () => {
    const hotel = await hotelRepository.findOne({});
    expect(hotel).toBeTruthy();

    const deletedHotel = await deleteHotel({ hotelRepository })(hotel.id);
    expect(deletedHotel).toBeTruthy();
    expect(deletedHotel).toEqual(true);
  });
});
