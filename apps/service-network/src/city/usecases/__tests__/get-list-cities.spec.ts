import { MikroORM } from "@mikro-orm/core";
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import * as path from "path";
import { NetworkEntities } from "../../../entities";
import getListCities from "../list-cities";
import City from "../../entity";
import { CityRepository } from "../../repository";

const expectResponseToHaveKeys = (city: City) => {
  Object.getOwnPropertyNames(city).forEach((property) => {
    expect(city).toHaveProperty(property);
  });
};

describe("get cities", () => {
  let orm: MikroORM;
  let cityRepository: CityRepository;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;
    cityRepository = orm.em.getRepository(City);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should get all cities", async () => {
    const [cities, count] = await getListCities({ cityRepository })({ page: 1, limit: null });
    cities.forEach((city) => expectResponseToHaveKeys(city));
    expect(count).toBeGreaterThan(0);
  });

  it("should filter one city by name", async () => {
    const city1 = await cityRepository.findOne({});

    const [cities, count] = await getListCities({ cityRepository })({ name: city1.name, page: 1, limit: null });
    expect(count).toBe(1);
    expect(cities.length).toBe(1);

    cities.forEach((city) => {
      expectResponseToHaveKeys(city);
      expect(city.name).toContain(city1.name);
    });
  });

  it("should return empty list when no city is found with matching criteria", async () => {
    const [cities, count] = await getListCities({ cityRepository })({ name: "test", page: 1, limit: null });
    expect(count).toBe(0);
    expect(cities.length).toBe(0);
  });
});
