import { ConflictError, getTestConnection, clearDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM, NotNullConstraintViolationException } from "@mikro-orm/core";
import { NetworkEntities } from "../../../entities";
import createCity, { ICreateCityInput, ICreateCityOutput } from "../create-city";
import City from "../../entity";
import { generateMockCity } from "../../../utils/mock-tests";
import { CityRepository } from "../../repository";

const expectResponseToHaveKeys = (city: ICreateCityOutput) => {
  Object.getOwnPropertyNames(city).forEach((property) => {
    expect(city).toHaveProperty(property);
  });
};

const validateValuesToHave = (data: ICreateCityOutput, city: ICreateCityInput) => {
  expect(data.name).toBe(city.name);
  expect(data.time_zone).toBe(city.time_zone);
  expect(data.state).toBe(city.state);
};

describe("create city", () => {
  let orm: MikroORM;
  let cityRepository: CityRepository;

  const validCreateCityInput = generateMockCity(false);
  const invalidCreateCityInput = generateMockCity(true);

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    orm = connection;
    cityRepository = orm.em.getRepository(City);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should create city", async () => {
    const city = await createCity({ cityRepository })(validCreateCityInput);
    expectResponseToHaveKeys(city);
    validateValuesToHave(city, validCreateCityInput);
  });

  it("should fail to create city due to constraint of duplicate city name", async () => {
    await expect(async () => {
      await createCity({ cityRepository })(validCreateCityInput);
    }).rejects.toThrowError(ConflictError);
  });

  it("should fail to create city because of validation constraint", async () => {
    await expect(async () => {
      await createCity({ cityRepository })(invalidCreateCityInput);
    }).rejects.toThrowError(NotNullConstraintViolationException);
  });
});
