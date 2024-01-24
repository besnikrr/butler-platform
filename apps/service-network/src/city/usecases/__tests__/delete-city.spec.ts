import {
  clearDatabase, ConflictError, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import deleteCity from "../delete-city";
import { generateMockCity } from "../../../utils/mock-tests";
import City from "../../entity";
import { CityRepository } from "../../repository";

describe("delete city test", () => {
  let orm: MikroORM;
  let cityRepository: CityRepository;

  const validCreateCityInput = generateMockCity(false);

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

  it("should delete the city", async () => {
    const city = cityRepository.create({ ...validCreateCityInput });
    await cityRepository.persistAndFlush(city);
    expect(city).toBeTruthy();
    const deletedCity = await deleteCity({ cityRepository })(city.id);
    expect(deletedCity).toBeTruthy();
  });

  it("should throw error when deleting a city that has associated hubs", async () => {
    const cityWithHubs = await cityRepository.findOne({
      hubs: { $ne: null }
    });

    await expect(async () => deleteCity({ cityRepository })(cityWithHubs.id)).rejects.toThrowError(ConflictError);
  });
});
