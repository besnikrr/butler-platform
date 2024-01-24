import path = require("path");
import { MikroORM } from "@mikro-orm/core";
import entities from "@services/service-order/src/utils/entities";
import { NetworkEntities } from "@services/service-network/src/entities";
import {
  connection,
  seedDatabase,
  clearDatabase,
  getTestConnection,
  DIConnectionObject
} from "@butlerhospitality/service-sdk";
import setKitchenConfirmedDate from "../set-kitchen-confirmed-date";

describe("Set kitchen confirm date usecase", () => {
  let findOneHubSpy;
  let IDependencyInjection;
  let orderConnection: MikroORM;
  let networkConnection: MikroORM;
  const validOrderId = 5;
  const invalidOrderId = 1;

  beforeAll(async () => {
    orderConnection = await getTestConnection(process.env.TEST_DB, entities);
    await seedDatabase(orderConnection, path.join(__dirname, "..", "..", "..", ".."));

    const networkRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-network");
    networkConnection = await getTestConnection("service_network_test", NetworkEntities.asArray());
    await seedDatabase(networkConnection, networkRootDir);

    IDependencyInjection = {
      connection: orderConnection,
      validate: true,
      tenant: "butler"
    };
  });

  afterAll(async () => {
    await clearDatabase(orderConnection);
    await orderConnection?.close(true);
    await clearDatabase(networkConnection);
    await networkConnection?.close(true);
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    findOneHubSpy = jest.spyOn(networkConnection.em, "findOne");
    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: networkConnection } as DIConnectionObject<any>));
  });

  it("should set the confirm kitchen date", async () => {
    findOneHubSpy.mockImplementation(() => Promise.resolve({ id: 1, has_expeditor_app_enabled: true }));
    const order = await setKitchenConfirmedDate(IDependencyInjection)(validOrderId, { version: 1 });
    expect(order).toBeDefined();
  });

  it("should throw an error because the expeditor is not enabled", async () => {
    findOneHubSpy.mockImplementation(() => Promise.resolve({ id: 1, has_expeditor_app_enabled: false }));
    await expect(async () => {
      await setKitchenConfirmedDate(IDependencyInjection)(validOrderId, { version: 2 });
    }).rejects.toThrowError("This hub does not have the expeditor app enabled.");
  });

  it("should throw an error because the orderStatus is not PREPARATION", async () => {
    await expect(async () => {
      await setKitchenConfirmedDate(IDependencyInjection)(invalidOrderId, { version: 1 });
    }).rejects.toThrowError("Order status is not in PREPARATION");
  });
});
