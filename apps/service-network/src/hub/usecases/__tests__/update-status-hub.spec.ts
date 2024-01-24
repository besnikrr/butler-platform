import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import City from "../../../city/entity";
import { NetworkEntities } from "../../../entities";
import { generateMockHub } from "../../../utils/mock-tests";
import Hub from "../../entity";
import { IHubRepository } from "../../repository";
import changeStatusHub from "../update-status";

describe("change hub status", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let cityRepository;
  let hub: Hub;
  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    hubRepository = orm.em.getRepository(Hub);
    cityRepository = orm.em.getRepository(City);
    const city = await cityRepository.findOne({});
    hub = await hubRepository.create({ ...generateMockHub(false), city });

    await orm.em.persistAndFlush(hub);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should deactivate hub if the hub does not have hotels", async () => {
    expect(hub).toBeTruthy();
    const status = false;
    const hubPayload = await changeStatusHub({ hubRepository })(hub.id, status);
    expect(hubPayload).toBeDefined();
    expect(hubPayload.active).toBe(status);
  });

  it("should activate hub", async () => {
    expect(hub).toBeTruthy();
    const status = true;
    const hubPayload = await changeStatusHub({ hubRepository })(hub.id, status);
    expect(hubPayload).toBeDefined();
    expect(hubPayload.active).toBe(status);
  });

  it("should throw not found when no hub is found", async () => {
    const status = false;
    const invalidHubId = -1;
    await expect(async () => {
      await changeStatusHub({ hubRepository })(invalidHubId, status);
    }).rejects.toThrowError(NotFoundError);
  });
});
