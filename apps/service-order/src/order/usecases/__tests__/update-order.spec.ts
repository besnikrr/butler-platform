import path = require("path");
import updateOrder from "../update-order";
import entities from "../../../utils/entities";
import { MikroORM, OptimisticLockError } from "@mikro-orm/core";
import { MenuEntities } from "@services/service-menu/src/entities";
import { NetworkEntities } from "@services/service-network/src/entities";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import { generateMockOrderUpdateInput } from "@services/service-order/src/utils/mock-tests";
import {
  connection,
  seedDatabase,
  NotFoundError,
  clearDatabase,
  getTestConnection,
  DIConnectionObject
} from "@butlerhospitality/service-sdk";

describe("Update Order", () => {
  let IDependencyInjection;
  let menuConnection: MikroORM;
  let orderConnection: MikroORM;
  let networkConnection: MikroORM;
  let voucherConnection: MikroORM;

  const validOrderId = 1;
  const invalidOrderId = -1;
  beforeAll(async () => {
    orderConnection = await getTestConnection(process.env.TEST_DB, entities);
    await seedDatabase(orderConnection, path.join(__dirname, "..", "..", "..", ".."));

    const networkRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-network");
    networkConnection = await getTestConnection("service_network_test", NetworkEntities.asArray());
    await seedDatabase(networkConnection, networkRootDir);

    const menuRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-menu");
    menuConnection = await getTestConnection("service_menu_test", MenuEntities.asArray());
    await seedDatabase(menuConnection, menuRootDir);

    IDependencyInjection = {
      connection: orderConnection,
      validate: true,
      tenant: "butler"
    };
  });

  beforeEach(async () => {
    jest.restoreAllMocks();
    const voucherRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-voucher");
    voucherConnection = await getTestConnection("service_voucher_test", VoucherEntities.asArray());
    await seedDatabase(voucherConnection, voucherRootDir);

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: networkConnection } as DIConnectionObject<any>));

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: menuConnection } as DIConnectionObject<any>));

    jest.spyOn(connection, "getConnection").mockImplementationOnce(() =>
      Promise.resolve({ conn: voucherConnection } as DIConnectionObject<any>));
  });

  afterAll(async () => {
    await clearDatabase(orderConnection);
    await orderConnection?.close(true);
    await clearDatabase(networkConnection);
    await networkConnection?.close(true);
    await clearDatabase(menuConnection);
    await menuConnection?.close(true);
  });

  afterEach(async () => {
    await clearDatabase(voucherConnection);
    await voucherConnection?.close(true);
  });

  it("should update an order", async () => {
    const updatedOrder =
      await updateOrder(IDependencyInjection)(validOrderId, generateMockOrderUpdateInput({}));

    expect(updatedOrder).toBeTruthy();
  });

  it("should throw an error if the version of order is not the same", async () => {
    await expect(
      updateOrder(IDependencyInjection)(validOrderId, generateMockOrderUpdateInput({ invalidVersion: true }))
    ).rejects.toThrowError(OptimisticLockError);
  });

  it("should throw an error if the order does not exist", async () => {
    await expect(
      updateOrder(IDependencyInjection)(invalidOrderId, generateMockOrderUpdateInput({ }))
    ).rejects.toThrowError(NotFoundError);
  });
});
