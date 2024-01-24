import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import entitiesArray from "../../../utils/entities";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { Order } from "../../entity";
import { User } from "../../../user/entity";
import { OrderRepository, UserRepository } from "../../repository";
import assignFoodCarrier, {
  IAssignOrderToFoodCarrierDependency,
  IAssignOrderToFoodCarrierOutput
} from "../assign-food-carrier";
import { OrderStatus } from "../../shared/enums";

describe("Assign food carrier usecase", () => {
  let orm: MikroORM;
  let orderRepository: OrderRepository; let userRepository: UserRepository;
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

  it("Should pickup an order", async () => {
    const dependencies: IAssignOrderToFoodCarrierDependency = {
      orderRepository,
      userRepository,
      tenant: process.env.TENANT,
      validate: false
    };
    const orderId = 5;
    const data = {
      userId: 4,
      version: 1,
      assignDate: new Date(Date.now())
    };
    const order = await assignFoodCarrier(dependencies)(orderId, data);

    expectResponseToHaveKeys(order);
    expect(order.status).toBe(OrderStatus.PREPARATION);
    expect(order?.meta?.assignDate).toBe(data.assignDate);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
