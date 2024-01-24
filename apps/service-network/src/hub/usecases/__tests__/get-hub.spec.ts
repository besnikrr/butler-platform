import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import path = require("path");
import { NetworkEntities } from "../../../entities";
import { ICreateHubOutput } from "../create-hub";
import Hub from "../../entity";
import getHub from "../get-hub";
import { IHubRepository } from "../../repository";

const expectResponseToHaveKeys = (hub: ICreateHubOutput) => {
  Object.getOwnPropertyNames(hub).forEach((property) => {
    expect(hub).toHaveProperty(property);
  });
};

describe("get hub", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;
  let testHub: Hub;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    hubRepository = orm.em.getRepository(Hub);
    testHub = await hubRepository.findOne({});
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should get one hub", async () => {
    const hub = await getHub({ hubRepository })(testHub.id);
    expectResponseToHaveKeys(hub);
    expect(hub).toEqual(testHub);
  });

  it("should throw not found if no hub is found", async () => {
    const invalidId = -1;
    await expect(async () => {
      await getHub({ hubRepository })(invalidId);
    }).rejects.toThrowError(NotFoundError);
  });
});
