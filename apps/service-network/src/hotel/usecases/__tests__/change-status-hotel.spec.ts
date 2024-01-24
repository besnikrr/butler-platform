import { clearDatabase, getTestConnection, NotFoundError, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import Hotel from "../../entity";
import changeStatusHotel from "../change-status-hotel";
import { HotelRepository } from "../../repository";

describe("change hotel status", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;

  let hotel: Hotel;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;

    hotelRepository = orm.em.getRepository(Hotel);

    hotel = await hotelRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should deactivate hotel", async () => {
    expect(hotel).toBeTruthy();

    const status = false;
    const hotelPayload = await changeStatusHotel({ hotelRepository })(hotel.id, status);

    expect(hotelPayload).toBeDefined();
    expect(hotelPayload.active).toBe(status);
  });

  it("should activate hotel", async () => {
    expect(hotel).toBeTruthy();

    const status = true;
    const hotelPayload = await changeStatusHotel({ hotelRepository })(hotel.id, status);

    expect(hotelPayload).toBeDefined();
    expect(hotelPayload.active).toBe(status);
  });

  it("should throw not found when the hotel does not exist", async () => {
    const status = false;
    const mockHotelId = -1;

    await expect(async () => {
      await changeStatusHotel({ hotelRepository })(mockHotelId, status);
    }).rejects.toThrowError(NotFoundError);
  });
});
