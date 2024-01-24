import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { Collection, MikroORM } from "@mikro-orm/core";
import * as path from "path";
import Hub from "../../hub/entities/hub";
import { HubRepository } from "../../hub/repository";
import { VoucherEntities } from "../../entities";
import { hubEvents } from "../voucher-on-hub-action";
import Hotel from "../../hotel/entities/hotel";

describe("hub event listener", () => {
  let orm: MikroORM;
  let hubRepository: HubRepository;
  const context = {};
  const data = {
    id: 9,
    name: "hub from test",
    active: true,
    created_at: new Date(),
    hotels: new Collection<Hotel>(this)
  };
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", ".."));
    hubRepository = orm.em.getRepository(Hub);
  });

  it("should create hub", async () => {
    await hubEvents(hubRepository).hubCreated(context, data);
    const hub = await hubRepository.getOneEntityOrFail(data.id);
    expect(hub).toBeDefined();
  });
  it("should update hub", async () => {
    await hubEvents(hubRepository).hubUpdated(context, data);
    const hub = await hubRepository.getOneEntityOrFail(data.id);
    expect(hub).toBeDefined();
    expect(hub.name).toBe(data.name);
  });
  it("should delete hub", async () => {
    await hubEvents(hubRepository).hubDeleted(context, data);

    expect(async () => {
      await hubRepository.getOneEntityOrFail(data.id);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
