import {
  BadRequestError,
  clearDatabase,
  connection,
  DIConnectionObject,
  getPaymentService,
  getTestConnection,
  NotFoundError,
  PaymentProvider,
  seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { ICancelOrderDependency } from "@services/service-order/src/order/usecases/cancel-order";
import * as path from "path";
import entitiesArray from "@services/service-order/src/utils/entities";
import { mockedTenant, PaymentType, PriceMeasurementType, VoucherPayer, VoucherType } from "@butlerhospitality/shared";
import refundOrder from "../refund-order";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import { faker } from "@faker-js/faker";
import * as calculation from "@services/service-order/utils/calculation";
import { clearCodeBlock, fetchCodesBlock } from "@services/service-voucher/src/code/blocks";
import { OrderStatus } from "@services/service-order/src/order/shared/enums";

jest.mock("@services/service-voucher/src/code/blocks");
const fetchCodesBlockMocked = fetchCodesBlock as jest.MockedFunction<typeof fetchCodesBlock>;
const clearCodeBlockMocked = clearCodeBlock as jest.MockedFunction<typeof clearCodeBlock>;

let conn: MikroORM;
let dependency: ICancelOrderDependency;
let voucherConnection: MikroORM;

const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, entitiesArray);
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
  dependency = { tenant: mockedTenant.name, conn };

  voucherConnection = await getTestConnection("service_voucher_test", VoucherEntities.asArray());
  await seedDatabase(voucherConnection, path.join(__dirname, "..", "..", "..", "..", "..", "service-voucher"));
};

beforeAll(() => {
  return setupTest();
});

const teardownTest = async () => {
  await clearDatabase(conn);
  await conn.close(true);

  await clearDatabase(voucherConnection);
  await voucherConnection.close(true);
};

afterAll(() => {
  return teardownTest();
});

const orderId = 1;
const transactionId = faker.datatype.uuid();
const order = { id: 1, status: OrderStatus.PENDING };

const testCases = [
  OrderStatus.REJECTED,
  OrderStatus.CANCELLED,
  OrderStatus.PENDING,
  OrderStatus.MERGED,
  OrderStatus.CONFIRMATION,
  OrderStatus.SCHEDULED,
  OrderStatus.IN_DELIVERY,
  OrderStatus.PREPARATION
];

describe("Refund Order", () => {
  let findOneSpy; let begin; let commit; let rollback;
  let findOneVoucherSpy; let findVoucherSpy;
  let paymentServiceRefund;
  let calculateRefundSpy;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();

    calculateRefundSpy = jest.spyOn(calculation, "calculateRefund");

    paymentServiceRefund = jest.spyOn(getPaymentService(PaymentProvider.SQUARE), "refund").mockImplementation(() => Promise.resolve({ id: faker.datatype.uuid() }));

    findOneSpy = jest.spyOn(conn.em, "findOne").mockImplementation(() => Promise.resolve(null));

    commit = jest.spyOn(conn.em, "commit").mockImplementation(() => Promise.resolve());
    rollback = jest.spyOn(conn.em, "rollback").mockImplementation(() => Promise.resolve());
    begin = jest.spyOn(conn.em, "begin").mockImplementation(() => Promise.resolve());

    jest.spyOn(connection, "getConnection").mockImplementationOnce(
      () => Promise.resolve({ conn: voucherConnection } as DIConnectionObject<any>)
    );

    findOneVoucherSpy = jest.spyOn(voucherConnection.em, "findOne");
    findVoucherSpy = jest.spyOn(voucherConnection.em, "find");

    jest.spyOn(voucherConnection.em, "getRepository").mockImplementation((): any => {
      return {
        find: jest.fn(() => ([{ order_id: 1, amount_used: 10, claimed_date: new Date() }])),
        flush: jest.fn(() => null)
      };
    });
  });

  it("should check for status changes", () => {
    expect(Object.keys(OrderStatus).length - 1).toEqual(testCases.length);
  });

  it("should throw if it cannot find order", async () => {
    findOneSpy.mockImplementation(() => null);
    await expect(refundOrder(dependency)(orderId, mockRefundPayload())).rejects.toThrow(new NotFoundError("Order"));
    expect(findOneSpy).toHaveBeenCalled();
  });

  test.each(testCases)("should throw for status: %p", async (status: OrderStatus) => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve({ ...order, status }));
    await expect(refundOrder(dependency)(orderId, mockRefundPayload())).rejects.toThrow(new BadRequestError(`Cannot refund order with status: ${status}.`));
  });

  it("should throw if current refund amount is lower or equal to previous amount for credit card payments", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve(mockOrder()))
      .mockImplementationOnce(() => Promise.resolve(mockRefundPayload()));
    await expect(refundOrder(dependency)(orderId, mockRefundPayload())).rejects.toThrow(new BadRequestError("New refund amount cannot be lower or equal to previous amount"));
    expect(commit).not.toHaveBeenCalled();
  });

  it("should allow lower refund for lower or equal to previous values for charge to room payments", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve({
      ...mockOrder(), paymentType: PaymentType.CHARGE_TO_ROOM
    })).mockImplementationOnce(() => Promise.resolve());
    await refundOrder(dependency)(orderId, mockRefundPayload());
    expect(commit).toHaveBeenCalled();
    expect(paymentServiceRefund).not.toHaveBeenCalled();
  });

  it("should refund order without vouchers", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve(mockOrder()));

    await refundOrder(dependency)(orderId, mockRefundPayload());

    expect(calculateRefundSpy).toHaveBeenCalledWith({
      vouchers: [],
      grandTotal: mockOrder().grandTotal,
      hotelGrandTotal: mockOrder().hotelGrandTotal,
      refund: {
        type: mockRefundPayload().type,
        value: mockRefundPayload().amount
      },
      totalVoucherPrice: 0,
      taxRate: 10
    });
    expect(paymentServiceRefund).toHaveBeenCalledWith({
      paymentId: transactionId,
      reason: mockRefundPayload().reason,
      amount: mockRefundPayload().amount
    });
    expect(commit).toHaveBeenCalled();
  });

  it("should use previous refund", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve(mockRefundedOrder()))
      .mockImplementationOnce(() => Promise.resolve(mockOrderRefund()));

    await refundOrder(dependency)(orderId, { ...mockRefundPayload(), amount: 7 });

    const calculationsParams = calculateRefundSpy.mock.calls[0][0];
    expect(calculationsParams.grandTotal).toEqual(mockOrderRefund().grandTotal);
    expect(calculationsParams.hotelGrandTotal).toEqual(mockOrderRefund().hotelGrandTotal);
    expect(calculationsParams.totalVoucherPrice).toEqual(mockOrderRefund().totalVoucherPrice);
    const calculations = calculateRefundSpy.mock.results[0].value;
    expect(paymentServiceRefund).toHaveBeenCalledWith({
      reason: mockRefundPayload().reason,
      amount: calculations.refundedGrandTotal,
      paymentId: transactionId
    });
  });

  it("should refund order with vouchers", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve(mockOrderWithVoucher()));
    fetchCodesBlockMocked.mockImplementationOnce(() => () => Promise.resolve([mockVoucherCode()] as CodeMockType));

    await refundOrder(dependency)(orderId, mockRefundPayload());

    expect(calculateRefundSpy.mock.calls[0][0].vouchers).toEqual([{
      id: mockVoucherCode().id,
      payer: mockVoucherCode().program.payer,
      value: mockVoucherCode().program.amount,
      valueUsed: mockVoucherCode().amount_used,
      payerPercentage: 100,
      type: VoucherType.PER_DIEM,
      paymentType: PaymentType.CREDIT_CARD
    }]);
    expect(calculateRefundSpy.mock.calls[0][0].discount).toEqual(undefined);
  });

  it("should call clear code, if totalVoucherPrice is greater than 0", async () => {
    findOneSpy.mockImplementationOnce(() => Promise.resolve({ ...mockOrderWithVoucher(), totalVoucherPrice: 2 }))
      .mockImplementationOnce(() => Promise.resolve({
        ...mockOrderRefund(),
        totalVoucherPrice: 20,
        hotelGrandTotal: 10,
        grandTotal: 20
      }));
    fetchCodesBlockMocked.mockImplementationOnce(() => () => Promise.resolve([mockVoucherCode()] as CodeMockType));
    const mockedFn = jest.fn();
    clearCodeBlockMocked.mockImplementationOnce(() => mockedFn);

    await refundOrder(dependency)(orderId, { ...mockRefundPayload(), amount: 25 });

    expect(calculateRefundSpy.mock.calls[0][0].totalVoucherPrice).toEqual(20);
    const calculations = calculateRefundSpy.mock.results[0].value;
    expect(mockedFn).toHaveBeenCalledWith({ amount: calculations.refundedTotalVoucherPrice, codeIds: [1] });
  });

  it("should call rollback if it throws in transaction", async () => {
    commit.mockImplementation(() => Promise.reject(new Error("Test rollback")));
    findOneSpy.mockImplementationOnce(() => Promise.resolve(mockOrder()));
    await expect(refundOrder(dependency)(orderId, mockRefundPayload())).rejects.toThrow(new Error("Test rollback"));
    expect(rollback).toHaveBeenCalled();
  });
});

function mockOrder() {
  return {
    id: 1,
    tip: 2,
    transactionId,
    grandTotal: 20,
    hotelGrandTotal: 15,
    totalVoucherPrice: 0,
    receiptAmount: 8,
    paymentType: PaymentType.CREDIT_CARD,
    status: OrderStatus.DELIVERED,
    meta: {
      hotelId: 1,
      taxRate: 10
    },
    vouchers: {
      getItems() {
        return [];
      }
    }
  };
}

function mockRefundedOrder() {
  return {
    ...mockOrder(),
    grandTotal: 15,
    hotelGrandTotal: 10,
    totalVoucherPrice: 0
  };
}

function mockOrderWithVoucher() {
  return {
    ...mockOrder(),
    vouchers: {
      getItems() {
        return [{ codeId: 1, type: VoucherType.DISCOUNT, amount: 5 }];
      }
    }
  };
}

function mockVoucherCode() {
  return {
    id: 1,
    program: {
      id: 1,
      amount: 10,
      payer_percentage: 100,
      payer: VoucherPayer.BUTLER,
      type: VoucherType.PER_DIEM
    },
    amount_used: 5
  };
}

function mockRefundPayload() {
  return {
    amount: 5,
    version: 1,
    reason: "Test",
    type: PriceMeasurementType.AMOUNT
  };
}

function mockOrderRefund() {
  return {
    amount: 5,
    grandTotal: 20,
    hotelGrandTotal: 15,
    totalVoucherPrice: 0,
    type: PriceMeasurementType.AMOUNT
  };
}

type CodeMockType = {
  id: number;
  program: {
    payer: string;
    amount: number;
    type: VoucherType;
    payer_percentage: number;
  },
  amount_used: number;
} & any;
