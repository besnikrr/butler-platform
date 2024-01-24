import * as path from "path";
import { Order } from "../../entity";
import { MikroORM } from "@mikro-orm/core";
import { User } from "../../../user/entity";
import { OrderStatus } from "../../shared/enums";
import entitiesArray from "../../../utils/entities";
import removeFoodCarrier from "../remove-food-carrier";
import { OrderRepository, UserRepository } from "../../repository";
import {
  IAssignOrderToFoodCarrierOutput,
  IAssignOrderToFoodCarrierDependency
} from "../assign-food-carrier";
import {
  seedDatabase,
  clearDatabase,
  BadRequestError,
  getTestConnection
} from "@butlerhospitality/service-sdk";

describe("Remove food carrier usecase", () => {
  let orm: MikroORM;
  let userRepository: UserRepository;
  let orderRepository: OrderRepository;
  const validOrderId = 2;
  const invalidOrderId = 5;

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
    orm = conn;
    orderRepository = conn.em.getRepository(Order);
    userRepository = conn.em.getRepository(User);
  });

  const expectResponseToHaveKeys = (order: IAssignOrderToFoodCarrierOutput) => {
    for (const property of Object.getOwnPropertyNames(order)) {
      expect(order).toHaveProperty(property);
    }
  };

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });

  it("Should remove food carrier from an order", async () => {
    const dependencies: IAssignOrderToFoodCarrierDependency = {
      orderRepository,
      userRepository,
      tenant: process.env.TENANT,
      validate: false
    };
    const order = await removeFoodCarrier(dependencies)(validOrderId, { version: 1 });
    expectResponseToHaveKeys(order);
    expect(order.status).toBe(OrderStatus.PREPARATION);
    expect(order?.meta?.assignDate).toBe(null);
    expect(order?.meta?.foodCarrier).toBe(null);
  });

  it("Should throw an error if order don't have an carrier id", async () => {
    const dependencies: IAssignOrderToFoodCarrierDependency = {
      orderRepository,
      userRepository,
      tenant: process.env.TENANT,
      validate: false
    };

    await expect(async () => {
      await removeFoodCarrier(dependencies)(invalidOrderId, { version: 1 });
    }).rejects.toThrowError(BadRequestError);
  });
});
