import {
  NotFoundError, clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { NetworkEntities } from "../../../entities";
import City from "../../entity";
import getCity from "../get-city";
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

  it("should get one city", async () => {
    const city = await cityRepository.findOne({});
    const cityFromUseCase = await getCity({ cityRepository })(city.id);
    expectResponseToHaveKeys(city);
    expect(city).toEqual(cityFromUseCase);
  });

  it("should throw not found if no city is found", async () => {
    const invalidId = -1;
    await expect(async () => {
      await getCity({ cityRepository })(invalidId);
    }).rejects.toThrowError(NotFoundError);
  });
});
