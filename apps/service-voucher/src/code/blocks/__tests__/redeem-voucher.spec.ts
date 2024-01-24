import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import * as path from "path";
import Code from "@services/service-voucher/src/code/entities/code";
import redeemVoucherBlock from "../redeem-voucher";
import { FakeCode } from "./mocks";
import { VoucherType } from "@butlerhospitality/shared";

const mockedDate = new Date();
const getMockedCode = (type?: VoucherType): FakeCode => {
  return {
    amount_used: null,
    claimed_date: null,
    program: {
      type: type || VoucherType.PER_DIEM
    }
  };
};

const perDiemCodeClaimedDateMock = "2022-05-06T09:15:00.871Z";
const getMockedCodeWithAmount = (type?: VoucherType): FakeCode => {
  return {
    amount_used: 4.6,
    claimed_date: perDiemCodeClaimedDateMock,
    program: {
      type: type || VoucherType.PER_DIEM
    }
  };
};

let conn: MikroORM;
const setupTest = async () => {
  conn = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
  await seedDatabase(conn, path.join(__dirname, "..", "..", "..", ".."));
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

describe("Redeem Voucher", () => {
  let findSpy; let codeRepository;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.getRealSystemTime();
    jest.useFakeTimers().setSystemTime(mockedDate.getTime());

    findSpy = jest.spyOn(conn.em, "find");
    jest.spyOn(conn.em, "getRepository").mockImplementation((): any => {
      return {
        find: findSpy,
        flush: jest.fn(() => null)
      };
    });
    codeRepository = conn.em.getRepository(Code);
    findSpy.mockImplementation(() => Promise.resolve([getMockedCode()]));
  });

  it("should convert to array single code Id", async () => {
    const codeId = 1; const amount = 2;
    await redeemVoucherBlock({ codeRepository })(codeId, amount);
    expect(findSpy).toHaveBeenCalledWith([codeId], ["program"]);
  });

  it("should fetch with multiple codes", async () => {
    const codeIds = [1, 2, 3]; const amount = 2;
    await redeemVoucherBlock({ codeRepository })(codeIds, amount);
    expect(findSpy).toHaveBeenCalledWith(codeIds, ["program"]);
  });

  const cases = [
    [getMockedCode(VoucherType.DISCOUNT), 2.5, mockedDate],
    [getMockedCode(VoucherType.PRE_FIXE), 2.5, mockedDate],
    [getMockedCode(VoucherType.PER_DIEM), 2.5, mockedDate],
    [getMockedCodeWithAmount(VoucherType.DISCOUNT), 2.5, mockedDate],
    [getMockedCodeWithAmount(VoucherType.PRE_FIXE), 2.5, mockedDate],
    [getMockedCodeWithAmount(VoucherType.PER_DIEM), 7.1, perDiemCodeClaimedDateMock]
  ];
  test.each(cases)("should handle different discount types", async (code: FakeCode, expectedAmunt: number, expectedDate: string) => {
    const codeIds = [1]; const amount = "2.5" as unknown as number;
    findSpy.mockImplementation(() => Promise.resolve([code]));
    await redeemVoucherBlock({ codeRepository })(codeIds, amount);
    expect(findSpy).toHaveBeenCalledWith(codeIds, ["program"]);
    expect(code.amount_used).toEqual(expectedAmunt);
    expect(code.claimed_date).toEqual(expectedDate);
  });
});
