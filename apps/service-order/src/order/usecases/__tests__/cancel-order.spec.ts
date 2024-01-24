import {
  clearDatabase,
  connection,
  DIConnectionObject,
  getTestConnection,
  seedDatabase,
	getPaymentService,
	PaymentProvider
} from "@butlerhospitality/service-sdk";
import entitiesArray from "@services/service-order/src/utils/entities";
import { mockedTenant, VoucherType } from "@butlerhospitality/shared";
import { LockMode, MikroORM } from "@mikro-orm/core";
import * as path from "path";
import cancelOrder, { ICancelOrderDependency } from "../cancel-order";
import { NetworkEntities } from "@services/service-network/src/entities";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import { faker } from "@faker-js/faker";
import { Order } from "@services/service-order/src/order/entities/order";
import { OrderStatus } from "../../shared/enums";

let conn: MikroORM;
let dependency: ICancelOrderDependency;
let networkConnection: MikroORM; let voucherConnection: MikroORM;
const networkRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-network");
const voucherRootDir = path.join(__dirname, "..", "..", "..", "..", "..", "service-voucher");

const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
  dependency = { tenant: mockedTenant.name, conn };

  networkConnection = await getTestConnection("service_network_test", NetworkEntities.asArray());
  await seedDatabase(networkConnection, networkRootDir);

  voucherConnection = await getTestConnection("service_voucher_test", VoucherEntities.asArray());
  await seedDatabase(voucherConnection, voucherRootDir);
};

beforeAll(() => {
  return setupTest();
});

const teardownTest = async () => {
  await clearDatabase(conn);
  await conn.close(true);

  await clearDatabase(networkConnection);
  await networkConnection.close(true);

  await clearDatabase(voucherConnection);
  await voucherConnection.close(true);
};

afterAll(() => {
  return teardownTest();
});

const payload = { version: 1, reason: "Test" };
const mockedTime = new Date();

type FakeOrderVoucher = {
  codeId: number;
  type: VoucherType;
  amount: number;
};

type FakeOrder = {
  id: number;
  status: OrderStatus;
  transaction?: string;
};

type FakeCode = {
  order_id: number;
  amount_used: number;
  claimed_date: Date;
};

describe.only("Cancel Order", () => {
  let cancelPayment; let findVoucherSpy;
  let flushSpy; let findOneOrderSpy; let findOrderSpy; let cancelPaymentSpy; let connectionSpy;
  let begin; let commit; let rollback; let voucherBegin; let voucherCommit; let voucherRollback;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.getRealSystemTime();
    jest.useFakeTimers().setSystemTime(mockedTime.getTime());

    findOneOrderSpy = jest.spyOn(conn.em, "findOne");
    findOrderSpy = jest.spyOn(conn.em, "find");
    findVoucherSpy = jest.fn(() => ([{ order_id: 1, amount_used: 10, claimed_date: new Date() }]));
    flushSpy = jest.spyOn(conn.em, "flush").mockImplementation(() => Promise.resolve());
    cancelPaymentSpy = jest.spyOn(getPaymentService(PaymentProvider.SQUARE), "cancel").mockImplementation(cancelPayment);
    connectionSpy = jest.spyOn(connection, "getConnection")
      .mockImplementation(() => Promise.resolve({ conn: voucherConnection } as DIConnectionObject<any>));

    begin = jest.spyOn(conn.em, "begin").mockImplementation(() => Promise.resolve());
    commit = jest.spyOn(conn.em, "commit").mockImplementation(() => Promise.resolve());
    rollback = jest.spyOn(conn.em, "rollback").mockImplementation(() => Promise.resolve());

    voucherBegin = jest.spyOn(voucherConnection.em, "begin").mockImplementation(() => Promise.resolve());
    voucherCommit = jest.spyOn(voucherConnection.em, "commit").mockImplementation(() => Promise.resolve());
    voucherRollback = jest.spyOn(voucherConnection.em, "rollback").mockImplementation(() => Promise.resolve());

    jest.spyOn(voucherConnection.em, "getRepository").mockImplementation((): any => {
      return {
        find: findVoucherSpy,
        flush: jest.fn(() => null)
      };
    });
  });

  it("should throw if it cannot find order", async () => {
    findOneOrderSpy.mockImplementation(() => Promise.resolve(null));
    await expect(cancelOrder(dependency)(1, payload)).rejects.toThrow("Order");
  });

  const invalidStatuses = [
    [OrderStatus.MERGED],
    [OrderStatus.REJECTED],
    [OrderStatus.SCHEDULED],
    [OrderStatus.DELIVERED],
    [OrderStatus.CANCELLED]
  ];
  test.each(invalidStatuses)("It should throw for status: %p", async (status: OrderStatus) => {
    findOneOrderSpy.mockImplementation(() => Promise.resolve({ id: 1, status }));
    await expect(cancelOrder(dependency)(1, payload))
      .rejects.toThrow(`Cannot cancel order with status: ${status}. Only order with statuses: ${OrderStatus.PREPARATION}, ${OrderStatus.IN_DELIVERY}, ${OrderStatus.CONFIRMATION} or ${OrderStatus.PENDING} can be cancelled`);
    expect(findOneOrderSpy).toHaveBeenCalledWith(Order, 1, {
      lockVersion: 1,
      lockMode: LockMode.OPTIMISTIC
    });
  });

  const validStatuses = [
    [OrderStatus.PENDING, getTestOrder(), getOrderVoucher(1), getCode(), { index: 0 }],
    [OrderStatus.PREPARATION, getTestOrder(), getOrderVoucher(2), getCode(), { index: 1 }],
    [OrderStatus.CONFIRMATION, getTestOrder(), getOrderVoucher(3), getCode(), { index: 2 }],
    [OrderStatus.IN_DELIVERY, getTestOrder2(), getOrderVoucher(4), getCode2(), { index: 3 }]
  ];
  test.each(validStatuses)("It should set status to cancel if order status is: %p", async (status: OrderStatus, testOrder: FakeOrder, orderVoucher: FakeOrderVoucher[], code: FakeCode, current: { index: number }) => {
    findOneOrderSpy.mockImplementationOnce(() => Promise.resolve(testOrder));
    findOrderSpy.mockImplementationOnce(() => Promise.resolve(orderVoucher));
    findVoucherSpy.mockImplementationOnce(() => Promise.resolve([code]));

    await cancelOrder(dependency)(1, payload);

    const order = await findOneOrderSpy.mock.results[0].value;
    expect(order.reason).toEqual(payload.reason);
    expect(order.status).toEqual(OrderStatus.CANCELLED);

    const codeValue = await findVoucherSpy.mock.results[0].value;
    expect(codeValue[0].claimed_date).toEqual(code.claimed_date);
    expect(codeValue[0].amount_used).toEqual(code.amount_used);
    expect(findVoucherSpy.mock.calls[0][0]).toEqual([current.index + 1]);

    expect(begin).toHaveBeenCalled();
    expect(commit).toHaveBeenCalled();
    expect(voucherBegin).toHaveBeenCalled();
    expect(voucherCommit).toHaveBeenCalled();
  });

  const paymentCases = [
    [getTestOrder(), 0],
    [getTestOrder2(), 1]
  ];
  test.each(paymentCases)("It should test payment cases", async (caseOrder: any, expected: number) => {
    findOneOrderSpy.mockImplementationOnce(() => Promise.resolve(caseOrder));
    findOrderSpy.mockImplementationOnce(() => Promise.resolve([{ type: VoucherType.PRE_FIXE, amount: 5 }]));

    await cancelOrder(dependency)(1, payload);
    expect(cancelPaymentSpy).toHaveBeenCalledTimes(expected);
  });

  it("should call rollback if it throws on transaction", async () => {
    findOneOrderSpy.mockImplementationOnce(() => Promise.resolve(getTestOrder()));
    findOrderSpy.mockImplementationOnce(() => Promise.resolve([{ type: VoucherType.PRE_FIXE, amount: 5 }]));

    commit.mockImplementation(() => Promise.reject(new Error("Testing Rollback")));
    await cancelOrder(dependency)(1, payload);
    expect(voucherCommit).toHaveBeenCalledTimes(0);
    expect(rollback).toHaveBeenCalled();
    expect(voucherRollback).toHaveBeenCalled();
  });
});

function getTestOrder() {
  return { id: 1, status: OrderStatus.PENDING };
}

function getTestOrder2() {
  return { id: 1, status: OrderStatus.PENDING, transactionId: faker.datatype.uuid() };
}

function getCode() {
  return { claimed_date: null, amount_used: 10 };
}

function getCode2() {
  return { claimed_date: mockedTime, amount_used: 5 };
}

function getOrderVoucher(id: number) {
  return [{ codeId: id, type: VoucherType.DISCOUNT, amount: 5 }];
}
