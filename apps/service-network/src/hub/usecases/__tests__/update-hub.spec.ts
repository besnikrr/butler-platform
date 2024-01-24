import {
  clearDatabase, ConflictError, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { ICityRepository } from "../../../city/repository";
import { NetworkEntities } from "../../../entities";
import Hub from "../../entity";
import { ICreateHubInput, ICreateHubOutput } from "../create-hub";
import updateHub from "../update-hub";
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

describe("update hub", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let cityRepository: ICityRepository;

  let city: City;
  let hub: Hub;
  let hub2: Hub;

  const invalidCreateHubInput = generateMockHub(true);
  const validCreateHubInput = generateMockHub(false);

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    hubRepository = orm.em.getRepository(Hub);
    cityRepository = orm.em.getRepository(City);

    city = await cityRepository.findOne({});
    hub = await hubRepository.findOne({});
    hub2 = await hubRepository.findOne({ id: { $ne: hub.id } });
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should update hub", async () => {
    expect(hub).toBeDefined();
    const updatedHub = await updateHub({
      hubRepository,
      cityRepository
    })(hub.id, { ...validCreateHubInput, city_id: city.id });
    expectResponseToHaveKeys(updatedHub);
    validateValuesToHave(updatedHub, validCreateHubInput, city);
  });

  it("should throw not found when hub does not exist", async () => {
    await expect(async () => {
      await updateHub({ hubRepository, cityRepository })(-1, null);
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail to update hub due to constraint of duplicate hub name", async () => {
    expect(hub).toBeTruthy();
    expect(hub2).toBeTruthy();
    await expect(async () => {
      await updateHub({ hubRepository, cityRepository })(hub2.id, { ...validCreateHubInput, city_id: city.id });
    }).rejects.toThrowError(ConflictError);
  });

  it("should throw not found error when trying to update hub with city that does not exist", async () => {
    await expect(async () => {
      await updateHub({
        hubRepository,
        cityRepository
      })(hub.id, { ...invalidCreateHubInput, name: "Test name", city_id: -1 });
    }).rejects.toThrowError(NotFoundError);
  });

  it("should fail to update hub because of validation constraints", async () => {
    await expect(async () => {
      await updateHub({ hubRepository, cityRepository })(hub.id, { ...invalidCreateHubInput, city_id: city.id });
    }).rejects.toThrowError(Error);
  });
});
