import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { IHotelRepository } from "../../../hotel/repository";
import { NetworkEntities } from "../../../entities";
import Hub from "../../entity";
import Hotel from "../../../hotel/entity";
import reassignHubHotels, { IHotelHubs } from "../reassign-hotels-hub";
import { IHubRepository } from "../../repository";

describe("reassign hub hotels and deactivate hub", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let hotelRepository: IHotelRepository;

  let hub: Hub;
  let hub2: Hub;
  let hotel: Hotel;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    hubRepository = orm.em.getRepository(Hub);
    hotelRepository = orm.em.getRepository(Hotel);

    hub = await hubRepository.findOne({});
    hub2 = await hubRepository.findOne({ id: { $ne: hub.id } });
    await hubRepository.populate(hub2, ["hotels"]);
    [hotel] = hub2.hotels;
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should reassign Hotels from Hub A to Hub B and deactivate Hub A", async () => {
    const data: IHotelHubs = {
      hotelId: hotel.id,
      hubId: hub2.id
    };

    const reassignPayload = await reassignHubHotels({ hubRepository, hotelRepository })([data], hub.id);
    expect(reassignPayload).toBeDefined();

    const hubPayload = await hubRepository.findOne(hub2.id);
    expect(hubPayload).toBeDefined();
    expect(hubPayload.hotels.length).toBe(1);
  });

  it("should fail to reassign hotels to hub and deactivate hub when no hotel id is passed", async () => {
    const data: IHotelHubs = {
      hotelId: null,
      hubId: hub2.id
    };

    await expect(async () => {
      await reassignHubHotels({ hubRepository, hotelRepository })([data], hub.id);
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail reassign hotels to hub and deactivate hub when no hub id is passed", async () => {
    const data: IHotelHubs = {
      hotelId: hotel.id,
      hubId: null
    };

    await expect(async () => {
      await reassignHubHotels({ hubRepository, hotelRepository })([data], hub2.id);
    }).rejects.toThrowError(NotFoundError);
  });
});
