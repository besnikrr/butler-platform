import path = require("path");
import faker from "@faker-js/faker";
import { Order } from "../../entity";
import { MikroORM } from "@mikro-orm/core";
import { OrderStatus } from "../../shared/enums";
import entitiesArray from "../../../utils/entities";
import { User } from "@services/service-order/src/user/entity";
import { OrderRepository, UserRepository } from "../../repository";
import assignOrderToMe, { IAssignOrderToMeDependency } from "../assign-order-to-me";
import { BadRequestError, clearDatabase, getTestConnection, seedDatabase, IAuthorizedUser } from "@butlerhospitality/service-sdk";

describe("Assign order to me usecase", () => {
  let orm: MikroORM;
  let orderRepository: OrderRepository; let userRepository: UserRepository;
  let dependencies: IAssignOrderToMeDependency;
  const data = {
    version: 1

  };

  const getFakeUser = (): IAuthorizedUser => {
    return {
      id: faker.datatype.number({ min: 1, max: 5 }),
      name: faker.name.firstName(),
      email: faker.internet.email()
    };
  };

  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    orm = conn;
    orderRepository = conn.em.getRepository(Order);
    userRepository = conn.em.getRepository(User);
  });

  beforeEach(async () => {
    dependencies = {
      orderRepository,
      userRepository,
      validate: false,
      user: getFakeUser()
    };
  });

  it("Should assign an order to me", async () => {
    const order = await assignOrderToMe(dependencies)(1, data);
    expect(order.status).toBe(OrderStatus.PENDING);
  });

  it("Should not be able to assign an order to me", async () => {
    await expect(async () => {
      await assignOrderToMe(dependencies)(3, data);
    }).rejects.toThrow(BadRequestError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
