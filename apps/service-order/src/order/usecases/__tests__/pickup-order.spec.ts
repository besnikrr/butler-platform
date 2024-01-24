import {
  BadRequestError,
  clearDatabase,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import entitiesArray from "../../../utils/entities";
import { MikroORM, OptimisticLockError } from "@mikro-orm/core";
import * as path from "path";
import pickupOrder, { IPickupOrderOutput, IPickupOrderDependency } from "../pickup-order";
import { OrderStatus } from "../../shared/enums";

describe("Pickup an order usecase", () => {
  let orm: MikroORM;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    orm = conn;
  });

  it("Should pickup an order", async () => {
    const dependencies: IPickupOrderDependency = {
      conn: orm,
      tenant: process.env.TENANT,
      validate: false
    };
    const orderId: number = 2;
    const order = await pickupOrder(dependencies)(orderId, { userId: 2, version: 1, pickupDate: new Date(Date.now()) });

    expectResponseToHaveKeys(order);
    expect(order.status).toBe(OrderStatus.IN_DELIVERY);
  });

  it("Should throw an exception if order is not with PREPARATION status", async () => {
    const dependencies: IPickupOrderDependency = {
      conn: orm,
      tenant: process.env.TENANT,
      validate: false
    };
    const orderId: number = 1;

    expect(async () => {
      await pickupOrder(dependencies)(orderId, { userId: 1, version: 1, pickupDate: new Date() });
    }).rejects.toThrowError(BadRequestError);
  });

  it("Should throw an exception if order does not exist", async () => {
    const dependencies: IPickupOrderDependency = {
      conn: orm,
      tenant: process.env.TENANT,
      validate: false
    };
    const orderId: number = 1000;

    expect(async () => {
      await pickupOrder(dependencies)(orderId, { userId: 1, version: 1, pickupDate: new Date(Date.now()) });
    }).rejects.toThrowError(NotFoundError);
  });

  it("Should throw an exception if order version does not match", async () => {
    const dependencies: IPickupOrderDependency = {
      conn: orm,
      tenant: process.env.TENANT,
      validate: false
    };
    const orderId: number = 2;
    expect(async () => {
      await pickupOrder(dependencies)(orderId, { userId: 1, version: 0, pickupDate: new Date(Date.now()) });
    }).rejects.toThrowError(OptimisticLockError);
  });

  const expectResponseToHaveKeys = (order: IPickupOrderOutput) => {
    for (const property of Object.getOwnPropertyNames(order)) {
      expect(order).toHaveProperty(property);
    }
  };

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
