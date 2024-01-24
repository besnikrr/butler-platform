
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import listMenuHotels from "../list-menu-hotels";
import Menu from "../../entities/menu";
import Hotel from "../../../hotel/entities/hotel";
import { IMenuRepository } from "../../repository";
import { MenuEntities } from "../../../entities";

describe("Use case - List menu hotels", () => {
  const expectResponseToHaveKeys = (hotel: Hotel) => {
    for (const property of Object.getOwnPropertyNames(hotel)) {
      expect(hotel).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: IMenuRepository;
  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    testMenu = await menuRepository.findOne({ hotels: { $ne: null } }, ["hotels"]);
  });

  it("should list menu hotels", async () => {
    const hotels = await listMenuHotels({ menuRepository })(testMenu.id);

    for (const hotel of hotels) {
      expectResponseToHaveKeys(hotel);
    }

    expect(hotels).toBeDefined();
    expect(hotels.length).toEqual(testMenu.hotels.length);
    expect(hotels).toEqual(testMenu.hotels.getItems());
  });

  it("should list menu hotels and filter by hotel ids", async () => {
    const hotelIds = [1, 2, 3];
    const hotels = await listMenuHotels({ menuRepository })(testMenu.id, hotelIds);

    const filteredHotels = testMenu.hotels.getItems().filter((hotel) => hotelIds.includes(hotel.id));

    for (const hotel of hotels) {
      expectResponseToHaveKeys(hotel);
    }

    expect(hotels).toBeDefined();
    expect(hotels.length).toBeLessThanOrEqual(filteredHotels.length);
    expect(hotels).toEqual(filteredHotels);
  });

  it("should return no menu hotels", async () => {
    const menu = await menuRepository.findOne(1);
    const hotels = await listMenuHotels({ menuRepository })(menu.id, [-1]);

    for (const hotel of hotels) {
      expectResponseToHaveKeys(hotel);
    }

    expect(hotels).toBeDefined();
    expect(hotels.length).toEqual(0);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
