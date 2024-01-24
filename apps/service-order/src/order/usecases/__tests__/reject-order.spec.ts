import { LockMode, MikroORM } from "@mikro-orm/core";
import {
  clearDatabase,
  connection,
  DIConnectionObject,
  getTestConnection,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { mockedTenant } from "@butlerhospitality/shared";
import * as path from "path";
import entitiesArray from "../../../utils/entities";
import { Order } from "@services/service-order/src/order/entities/order";
import rejectOrder, {
  IRejectOrderDependency,
  IRejectOrderInput
} from "@services/service-order/src/order/usecases/reject-order";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import {
  getVoucherConnection,
  saveOrderAndClearCodeTransaction
} from "@services/service-order/src/order/usecases/cancel-order";
import { OrderStatus } from "../../shared/enums";

jest.mock("../cancel-order");
const getVoucherConnectionMocked = getVoucherConnection as jest.MockedFunction<typeof getVoucherConnection>;
const saveOrderAndClearCodeTransactionMocked =
  saveOrderAndClearCodeTransaction as jest.MockedFunction<typeof saveOrderAndClearCodeTransaction>;

const orderId = 1;
const payload = { version: 1, reason: "Test" };
const createFakeResponse = () => {
  return {
    id: orderId,
    reason: null,
    status: OrderStatus.PENDING
  };
};

let conn: MikroORM;
let dependency: IRejectOrderDependency;
let voucherConnection;
const voucherRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-voucher");

const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
  dependency = { tenant: mockedTenant.name, conn };

  voucherConnection = await getTestConnection("service_voucher_test", VoucherEntities.asArray());
  await seedDatabase(voucherConnection, voucherRootDir);
};

beforeAll(() => {
  return setupTest();
});

const teardownTest = async () => {
  await clearDatabase(conn);
  await conn.close(true);
};

afterAll(() => {
  return teardownTest();
});

describe("Reject Order", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.spyOn(connection, "getConnection")
      .mockImplementation(() => Promise.resolve({ conn: voucherConnection } as DIConnectionObject<any>));
  });

  it("should throw if it cannot find order", async () => {
    jest.spyOn(conn.em, "findOne").mockImplementation(() => Promise.resolve(null));
    await expect(rejectOrder(dependency)(1, payload)).rejects.toThrow("Order");
  });

  const statusCases = [
    [payload, OrderStatus.CONFIRMATION],
    [payload, OrderStatus.SCHEDULED],
    [payload, OrderStatus.REJECTED],
    [payload, OrderStatus.MERGED],
    [payload, OrderStatus.PREPARATION],
    [payload, OrderStatus.IN_DELIVERY],
    [payload, OrderStatus.DELIVERED],
    [payload, OrderStatus.CANCELLED]
  ];

  test.each(statusCases)("it should validate status for %p and status %p",
    async (payload: IRejectOrderInput, status: OrderStatus) => {
      const spy = jest.spyOn(conn.em, "findOne")
        .mockImplementation(() => Promise.resolve({ id: orderId, status }));
      await expect(rejectOrder(dependency)(orderId, payload)).rejects.toThrow(
        "Cannot reject order. Only orders with status PENDING can be rejected"
      );
      expect(spy).toHaveBeenCalledWith(Order, orderId, {
        lockMode: LockMode.OPTIMISTIC, lockVersion: payload.version
      });
    });

  it("should set rejected state and reason", async () => {
    const findSpy = jest.spyOn(conn.em, "findOne").mockImplementation(() => Promise.resolve(createFakeResponse()));
    getVoucherConnectionMocked.mockImplementation(() => ({} as jest.MockedFunction<any>));
    await rejectOrder(dependency)(orderId, payload);
    const order = await findSpy.mock.results[0].value;
    expect(order.status).toEqual(OrderStatus.REJECTED);
    expect(order.reason).toEqual(payload.reason);
    expect(getVoucherConnectionMocked).toHaveBeenCalled();
    expect(saveOrderAndClearCodeTransactionMocked).toHaveBeenCalled();
  });
});
