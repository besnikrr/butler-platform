import {
  clearDatabase,
  CustomEntityRepository,
  getTestConnection,
  NotFoundError,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import entitiesArray from "../../../utils/entities";
import { IOrder, Order } from "../../entity";
import getOrder from "../get-order";
import * as path from "path";

describe("Get order usecase", () => {
  let orderRepository: CustomEntityRepository<Order>;
  let orm: MikroORM;
  let testOrder: IOrder;
  beforeAll(async () => {
    const conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
    await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

    orm = conn;
    orderRepository = conn.em.getRepository(Order);

    testOrder = await orderRepository.findOne({});
  });

  const expectResponseToHaveKeys = (order: IOrder) => {
    for (const property of Object.getOwnPropertyNames(order)) {
      expect(order).toHaveProperty(property);
    }
  };

  it("Should get an order by id", async () => {
    const order = await getOrder({ orderRepository })(testOrder.id);

    expectResponseToHaveKeys(order);

    expect(order).toBeDefined();
    expect(order).toEqual(testOrder);
  });

  it("Should fail to get an order by id", async () => {
    await expect(async () => getOrder({ orderRepository })(-1)).rejects.toThrow(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
