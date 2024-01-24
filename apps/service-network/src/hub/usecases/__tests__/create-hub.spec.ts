import {
  clearDatabase, ConflictError, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { NotNullConstraintViolationException, MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { ICityRepository } from "../../../city/repository";
import { NetworkEntities } from "../../../entities";
import Hub from "../../entity";
import createHub, { ICreateHubInput, ICreateHubOutput } from "../create-hub";
import City from "../../../city/entity";
import { generateMockHub } from "../../../utils/mock-tests";
import { IHubRepository } from "../../repository";

const expectResponseToHaveKeys = (hub: ICreateHubOutput) => {
  Object.getOwnPropertyNames(hub).forEach((property) => {
    expect(hub).toHaveProperty(property);
  });
};

const validateValuesToHave = (data: ICreateHubOutput, hub: ICreateHubInput, city: City) => {
  expect(data.name).toBe(hub.name);
  expect(data.city.id).toBe(city.id);
  expect(data.contact_email).toBe(hub.contact_email);
  expect(data.address_town).toBe(hub.address_town);
  expect(data.address_street).toBe(hub.address_street);
  expect(data.address_number).toBe(hub.address_number);
  expect(data.address_zip_code).toBe(hub.address_zip_code);
  expect(data.tax_rate).toBe(hub.tax_rate);
  expect(data.address_coordinates).toBe(hub.address_coordinates);
  expect(data.has_nextmv_enabled).toBe(hub.has_nextmv_enabled);
  expect(data.has_expeditor_app_enabled).toBe(hub.has_expeditor_app_enabled);
};

describe("create hub", () => {
  let orm: MikroORM;
  let cityRepository: ICityRepository;
  let hubRepository: IHubRepository;

  const validCreateHubInput = generateMockHub(false);
  const invalidCreateHubInput = generateMockHub(true);

  let city: City;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    cityRepository = orm.em.getRepository(City);
    hubRepository = orm.em.getRepository(Hub);

    city = await cityRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should create hub", async () => {
    expect(city).toBeTruthy();

    const hub = await createHub({ hubRepository, cityRepository })({ ...validCreateHubInput, city_id: city.id });
    expect(hub).toBeTruthy();

    expectResponseToHaveKeys(hub);
    validateValuesToHave(hub, validCreateHubInput, city);
  });

  it("should not create hub due to constraint of duplicate hub name", async () => {
    await expect(async () => {
      await createHub({ hubRepository, cityRepository })({ ...validCreateHubInput, city_id: city.id });
    }).rejects.toThrowError(ConflictError);
  });

  it("should throw not found error when trying to save a hub with a city that does not exist", async () => {
    await expect(async () => {
      await createHub({ hubRepository, cityRepository })({ ...validCreateHubInput, name: "Test name", city_id: -1 });
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail to create hub because of validation constraints", async () => {
    expect(city).toBeTruthy();
    await expect(async () => {
      await createHub({ hubRepository, cityRepository })({ ...invalidCreateHubInput, city_id: city.id });
    }).rejects.toThrowError(NotNullConstraintViolationException);
  });
});
