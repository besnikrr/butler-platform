import confirmOrder, { IConfirmOrderDependency } from "../confirm-order";
import { mockedTenant } from "@butlerhospitality/shared";
import { MikroORM } from "@mikro-orm/core";
import {
  analytics,
  AnalyticsProviderType,
  clearDatabase,
  connection,
  DIConnectionObject,
  getTestConnection,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import * as path from "path";
import entitiesArray from "../../../utils/entities";
import { NetworkEntities } from "@services/service-network/src/entities";
import { OrderStatus } from "../../shared/enums";
import { IAuthorizedUser } from "@butlerhospitality/service-sdk";

const orderId = 1;
const statusCases = Object.values(OrderStatus).filter((status) => status !== OrderStatus.PENDING);
const payload = { version: 1, printReceipt: false };

let conn: MikroORM;
let dependency: IConfirmOrderDependency;
let networkConnection: MikroORM;
const networkRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-network");

const getMockedUser = (): IAuthorizedUser => {
  return {
    id: 1,
    name: "Test",
    email: "test@butlerhospitality.com"
  };
};

const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));

  dependency = { tenant: mockedTenant.name, connection: conn, user: getMockedUser() };
  networkConnection = await getTestConnection("service_network_test", NetworkEntities.asArray());
  await seedDatabase(networkConnection, networkRootDir);
};

beforeAll(() => {
  return setupTest();
});

const teardownTest = async () => {
  await clearDatabase(conn);
  await conn.close(true);
  jest.useRealTimers();
  await clearDatabase(networkConnection);
  await networkConnection.close(true);
};

afterAll(() => {
  return teardownTest();
});

describe("ConfirmOrder", () => {
  let findOneSpy; let flushSpy; let analyticsSpy;
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date());

    findOneSpy = jest.spyOn(conn.em, "findOne");
    flushSpy = jest.spyOn(conn.em, "flush");
    analyticsSpy = jest.spyOn(analytics(AnalyticsProviderType.SEGMENT), "track");
  });

  test.each(statusCases)("should throw status error for: %p", async (status: string) => {
    jest.spyOn(conn.em, "findOne").mockImplementation(() => ({ status, meta: {} } as any));
    await expect(confirmOrder(dependency)(orderId, payload))
      .rejects.toThrow("Cannot confirm order. Order status is not PENDING.");
  });

  it("should update status and notify client", async () => {
    await confirmOrder(dependency)(orderId, payload);
    const order = await findOneSpy.mock.results[0].value;

    expect(order.status).toEqual(OrderStatus.CONFIRMATION);
    expect(order.confirmedDate).toEqual(new Date());
    expect(flushSpy).toHaveBeenCalled();
    expect(analyticsSpy).toHaveBeenCalledWith("ORDER_CONFIRMED", order.meta.dispatcher.id, order);
  });

  it("should call getHubBlock", async () => {
    jest.spyOn(connection, "getConnection")
      .mockImplementation(() => Promise.resolve({ conn: networkConnection } as DIConnectionObject<any>));
    const findOneNetwork = jest.spyOn(networkConnection.em, "findOne");
    findOneSpy.mockImplementationOnce(() => Promise.resolve({
      ...payload,
      printReceipt: true,
      meta: { hubId: 1 },
      status: OrderStatus.PENDING
    }));
    await confirmOrder(dependency)(orderId, payload);
    expect(findOneNetwork).toHaveBeenCalled();
  });
});
