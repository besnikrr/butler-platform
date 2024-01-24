import {
  clearDatabase, ConflictError, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { NetworkEntities } from "../../../entities";
import Hub from "../../entity";
import { IHubRepository } from "../../repository";
import deleteHub from "../delete-hub";

describe("delete hub", () => {
  let orm: MikroORM;
  let hubRepository: IHubRepository;

  beforeAll(async () => {
    const connection = await getTestConnection(process.env.TEST_DB, NetworkEntities.asArray());
    await seedDatabase(connection, path.join(__dirname, "..", "..", "..", ".."));
    orm = connection;

    hubRepository = orm.em.getRepository(Hub);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("should delete the hub", async () => {
    const hub = await hubRepository.findOne({ hotels: { $eq: null } }, ["city"]);
    await hubRepository.persistAndFlush(hub);
    const deletedHub = await deleteHub({ hubRepository })(hub.id);
    expect(deletedHub).toBeTruthy();
  });

  it("should fail to delete hub if the hub has related hotels", async () => {
    const hub = await hubRepository.findOne({ hotels: { $ne: null } });
    await expect(async () => deleteHub({ hubRepository })(hub.id)).rejects.toThrowError(ConflictError);
  });
});
