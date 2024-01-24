import {
  ConflictError, clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { NetworkEntities } from "../../../entities";
import updateCity, { IUpdateCityOutput } from "../update-city";
import { generateMockCity } from "../../../utils/mock-tests";
import City from "../../entity";
import { ICreateCityInput } from "../create-city";
import { CityRepository } from "../../repository";

const expectResponseToHaveKeys = (city: IUpdateCityOutput) => {
  Object.getOwnPropertyNames(city).forEach((property) => {
    expect(city).toHaveProperty(property);
  });
};

const validateValuesToHave = (data: IUpdateCityOutput, city: ICreateCityInput) => {
  expect(data.name).toBe(city.name);
  expect(data.time_zone).toBe(city.time_zone);
  expect(data.state).toBe(city.state);
};

describe("update city", () => {
  let orm: MikroORM;
  let cityRepository: CityRepository;

  const validUpdateCityValues = generateMockCity(false);
  const invalidUpdateCityValues = generateMockCity(true);
  let city: City;
  let city2: City;
  let city3: City;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;
    cityRepository = orm.em.getRepository(City);

    city = await cityRepository.findOne({});
    city2 = await cityRepository.findOne({ id: { $ne: city.id } });
    city3 = await cityRepository.findOne({ id: { $nin: [city.id, city2.id] } });
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
  it("should update city", async () => {
    const updatedCity = await updateCity({ cityRepository })(city.id, validUpdateCityValues);

    expectResponseToHaveKeys(updatedCity);
    validateValuesToHave(updatedCity, validUpdateCityValues);
  });

  it("should fail to update city due to constraint of duplicate city name", async () => {
    await expect(async () => {
      await updateCity({ cityRepository })(city3.id, city2);
    }).rejects.toThrowError(ConflictError);
  });

  it("should fail to update city because of validation constraints", async () => {
    await expect(async () => {
      await updateCity({ cityRepository })(city.id, invalidUpdateCityValues);
    }).rejects.toThrowError(Error);
  });

  it("should fail to update non-existing city ", async () => {
    const invalidId = -1;
    await expect(async () => {
      await updateCity({ cityRepository })(invalidId, invalidUpdateCityValues);
    }).rejects.toThrowError(Error);
  });
});
