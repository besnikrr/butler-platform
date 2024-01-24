
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IHotelRepository } from "../../../hotel/repository";
import { ICategoryRepository } from "../../../category/repository";
import { IMenuRepository } from "../../repository";
import assignMenuHotels from "../assign-menu-hotels";
import Menu from "../../entities/menu";
import Hotel from "../../../hotel/entities/hotel";
import Category from "../../../category/entities/category";
import { MenuEntities } from "../../../entities";

describe("Use case - Assign menu hotels", () => {
  const expectResponseToHaveKeys = (menu: Menu) => {
    for (const property of Object.getOwnPropertyNames(menu)) {
      expect(menu).toHaveProperty(property);
    }
  };

  let orm: MikroORM;
  let menuRepository: IMenuRepository;
  let hotelRepository: IHotelRepository;
  let categoryRepository: ICategoryRepository;

  let testMenu: Menu;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, MenuEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    menuRepository = orm.em.getRepository(Menu);
    hotelRepository = orm.em.getRepository(Hotel);
    categoryRepository = orm.em.getRepository(Category);

    testMenu = await menuRepository.findOne({});
  });

  it("should assign hotels to a menu", async () => {
    const hotelIds = [1, 2, 3];

    const menu = await assignMenuHotels({ menuRepository, hotelRepository, categoryRepository })(testMenu.id, {
      hotel_ids: hotelIds
    });

    expectResponseToHaveKeys(menu);

    expect(menu.id).toEqual(testMenu.id);
    expect(menu.hotels.length).toEqual(hotelIds.length);
    expect(menu.hotels.getItems().map((hotel) => hotel.id)).toEqual(hotelIds);
  });

  it("should remove all hotels from a menu", async () => {
    const hotelIds = [];

    const menu = await assignMenuHotels({ menuRepository, hotelRepository, categoryRepository })(testMenu.id, {
      hotel_ids: hotelIds
    });

    expectResponseToHaveKeys(menu);

    expect(menu.id).toEqual(testMenu.id);
    expect(menu.hotels.length).toEqual(hotelIds.length);
  });

  afterAll(async () => {
    await clearDatabase(orm);

    await orm?.close(true);
  });
});
