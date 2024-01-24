
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import Hotel from "../../entities/hotel";
import listHotels from "../list-hotels";
import { MenuEntities } from "../../../entities";
import { IHotelRepository } from "../../repository";

describe("List hotels usecase", () => {
  const expectResponseToHaveKeys = (hotel: Hotel) => {
    for (const property of Object.getOwnPropertyNames(hotel)) {
      expect(hotel).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let hotelRepository: IHotelRepository;
  let hotelToSearch: Hotel;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    orm = conn;
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    hotelRepository = conn.em.getRepository(Hotel);
  });

  it("should list all hotels", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({ page: 1, limit: 10 });
    [hotelToSearch] = hotels;
    hotels.map((hotel) => expectResponseToHaveKeys(hotel));
    expect(count).toBeGreaterThan(0);
  });

  it("should filter hotels by name", async () => {
    const [hotels, count] = await listHotels({ hotelRepository })({ name: hotelToSearch.name, page: 1, limit: 10 });

    hotels.forEach((hotel) => {
      expectResponseToHaveKeys(hotel);
      expect(hotel.name).toContain(hotelToSearch.name);
    });
    expect(count).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm.close(true);
  });
});
