import {
  clearDatabase, CustomEntityRepository, getTestConnection, seedDatabase, validateInput
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { MealPeriod } from "@butlerhospitality/shared";
import Hotel from "../../hotel/entity";
import { NetworkEntities } from "../../entities";
import { hotelEvents } from "../network-on-menu-action";
import { getDefaultOperatingHours } from "../../utils/operating-hours";

describe("hub event listener", () => {
  let orm: MikroORM;
  let hotelRepository: CustomEntityRepository<Hotel>;
  let defaultOperatingHours;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", ".."));
    orm = connection;
    hotelRepository = orm.em.getRepository(Hotel);
    defaultOperatingHours = getDefaultOperatingHours([
      MealPeriod.Breakfast,
      MealPeriod.Lunch_Dinner,
      MealPeriod.Convenience
    ]);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  const validateHotelsOperatingHours = async (hotels: Hotel[]) => {
    for (const hotel of hotels) {
      expect(
        (async () => {
          await validateInput(hotel.operating_hours);
        }).length
      ).not.toBeTruthy();
      expect(JSON.stringify(hotel.operating_hours)).toBe(JSON.stringify(defaultOperatingHours));
    }
  };

  it("should assign menu to hotels", async () => {
    const data = {
      id: 1,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
      name: "Menu1",
      status: "INACTIVE",
      products: [],
      hotels: [
        {
          id: 1,
          created_at: new Date(),
          updated_at: null,
          name: "Hotel4",
          hub: 3
        },
        {
          id: 2,
          created_at: new Date(),
          updated_at: null,
          name: "Hotel4",
          hub: 3
        }
      ],
      entity: "menu",
      unassignedHotelIds: []
    };

    await hotelEvents(hotelRepository).hotelsAssigned(data);
    const hotels = await hotelRepository.find({ id: { $in: data.hotels.map((el) => el.id) } });
    await validateHotelsOperatingHours(hotels);
  });
});
