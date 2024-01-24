
import {
  clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import Hotel from "../../entity";
import listHotels from "../list-hotels";
import Hub from "../../../hub/entity";
import { HotelRepository } from "../../repository";
import { IHubRepository } from "../../../hub/repository";

describe("get hotels", () => {
  let orm: MikroORM;
  let hotelRepository: HotelRepository;
  let hubRepository: IHubRepository;

  let testHotel: Hotel;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));

    orm = connection;
    hotelRepository = orm.em.getRepository(Hotel);
    hubRepository = orm.em.getRepository(Hub);

    testHotel = await hotelRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  const expectResponseToHaveKeys = (hotel: Hotel) => {
    for (const property of Object.getOwnPropertyNames(hotel)) {
      expect(hotel).toHaveProperty(property);
    }
  };

  it("should get all hotels", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({
      page: 1,
      limit: null
    });

    expect(count).toBeGreaterThan(0);
    hotels.forEach((hotel) => expectResponseToHaveKeys(hotel));
  });

  it("should get hotels with filter criteria by name", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({
      name: testHotel.name,
      page: 1,
      limit: null
    });

    expect(count).toBe(1);
    hotels.forEach((hotel) => {
      expectResponseToHaveKeys(hotel);
      expect(hotel.name).toContain(testHotel.name);
    });
  });

  it("should get hotels with filter criteria by hubs", async () => {
    const hubs = await hubRepository.findAll(["hotels"]);

    const hubsWithHotels = hubs.find((hub) => hub.hotels.length > 0);
    const hubsWithoutHotels = hubs.find((hub) => hub.hotels.length === 0);

    const [hotels, count] = await listHotels({ hotelRepository })({
      hub_ids: [`${hubsWithHotels.id}`, `${hubsWithoutHotels.id}`],
      page: 1,
      limit: null
    });

    expect(count).toBe(1);
    hotels.forEach((hotel) => {
      expectResponseToHaveKeys(hotel);
      expect(hotel.hub.id).toEqual(hubsWithHotels.id);
    });
  });

  it("should get empty list when filtering by hub without hotels", async () => {
    const hubs = await hubRepository.findAll(["hotels"]);

    const hubsWithoutHotels = hubs.find((hub) => hub.hotels.length === 0);

    const [hotels, count] = await listHotels({ hotelRepository })({
      hub_ids: [`${hubsWithoutHotels.id}`],
      page: 1,
      limit: null
    });

    expect(count).toBe(0);
    expect(hotels.length).toBe(0);
  });

  it("should return empty list when there are no hotels with matching filter criteria", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({
      hub_ids: ["-1"],
      page: 1,
      limit: null
    });
    expect(count).toBe(0);
    expect(hotels.length).toBe(0);
  });

  it("should get hotels with filter criteria by account manager", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({
      account_manager: testHotel.account_manager_id,
      page: 1,
      limit: null
    });

    expect(count).toBeGreaterThan(0);
    hotels.forEach((hotel) => {
      expectResponseToHaveKeys(hotel);
      expect(hotel.account_manager_id).toEqual(testHotel.account_manager_id);
    });
  });
});
