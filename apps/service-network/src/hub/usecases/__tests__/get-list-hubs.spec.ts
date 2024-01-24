
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { ICityRepository } from "../../../city/repository";
import { NetworkEntities } from "../../../entities";
import Hub from "../../entity";
import listHubs from "../list-hubs";
import City from "../../../city/entity";
import { IHubRepository } from "../../repository";

const expectResponseToHaveKeys = (hub: Hub) => {
  for (const property of Object.getOwnPropertyNames(hub)) {
    expect(hub).toHaveProperty(property);
  }
};

describe("get hubs", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let cityRepository: ICityRepository;

  let testHub: Hub;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    hubRepository = orm.em.getRepository(Hub);
    cityRepository = orm.em.getRepository(City);

    testHub = await hubRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should get all hubs", async () => {
    const [hubs, count] = await listHubs({ hubRepository })({ page: 1, limit: null });
    expect(count).toBeGreaterThan(0);
    expect(hubs.length).toBeGreaterThan(0);
    hubs.forEach((hub) => expectResponseToHaveKeys(hub));
  });

  it("should get hubs with filter by name", async () => {
    const [hubs, count] = await listHubs({ hubRepository })({ name: testHub.name, page: 1, limit: null });

    expect(count).toBe(1);
    expect(hubs.length).toBe(1);

    hubs.forEach((hub) => {
      expectResponseToHaveKeys(hub);
      expect(hub.name).toContain(testHub.name);
    });
  });

  it("should get hubs with filter by multiple cities", async () => {
    const city = await cityRepository.findAll(["hubs"]);

    const cityWithoutHubs = city.find((c) => c.hubs.length === 0);
    const cityWithHubs = city.find((c) => c.hubs.length > 0);

    const [hubs, count] = await listHubs({ hubRepository })({
      city_ids: [`${cityWithHubs.id}`, `${cityWithoutHubs.id}`],
      page: 1,
      limit: null
    });

    expect(count).toBe(4);
    expect(hubs.length).toBe(4);

    hubs.forEach((hub) => {
      expectResponseToHaveKeys(hub);
      expect(hub.city.id).toEqual(cityWithHubs.id);
    });
  });

  it("should get empty list when filtering by city without hubs", async () => {
    const city = await cityRepository.findAll(["hubs"]);

    const cityWithoutHubs = city.find((c) => c.hubs.length === 0);

    const [hubs, count] = await listHubs({ hubRepository })({
      city_ids: [`${cityWithoutHubs.id}`],
      page: 1,
      limit: null
    });

    expect(count).toBe(0);
    expect(hubs.length).toBe(0);
  });

  it("should return empty list when no hubs are found with matching criteria", async () => {
    const [hubs, count] = await listHubs({ hubRepository })({ name: "NON_EXISTING_HUB", page: 1, limit: null });
    expect(count).toEqual(0);
    expect(hubs.length).toEqual(0);
  });
});
