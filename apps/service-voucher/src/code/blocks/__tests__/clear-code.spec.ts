import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { VoucherEntities } from "@services/service-voucher/src/entities";
import * as path from "path";
import Code from "@services/service-voucher/src/code/entities/code";
import clearCodeBlock from "../clear-code";
import { VoucherType } from "@butlerhospitality/shared";
import { FakeCode } from "./mocks";

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

describe("Clear Code", () => {
  let findSpy; let codeRepository;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.getRealSystemTime();

    findSpy = jest.spyOn(conn.em, "find");
    jest.spyOn(conn.em, "getRepository").mockImplementation((): any => {
      return {
        find: findSpy,
        flush: jest.fn(() => null)
      };
    });
    codeRepository = conn.em.getRepository(Code);
  });

  it("should call find with codeIds", async () => {
    findSpy.mockImplementation(() => Promise.resolve([]));
    await clearCodeBlock({ codeRepository })({ codeIds: [1, 2] });
    expect(findSpy).toHaveBeenCalledWith([1, 2], ["program"]);
  });

  const claimedDate = new Date().toISOString();
  const singleCodeCases = [
    [[{ amount_used: 4.9, claimed_date: claimedDate }], [2, claimedDate]],
    [[{ amount_used: 3, claimed_date: claimedDate }], [0.1, claimedDate]],
    [[{ amount_used: 2.9, claimed_date: claimedDate }], [0, null]],
    [[{ amount_used: 2, claimed_date: claimedDate }], [0, null]],
    [[{ amount_used: 0, claimed_date: claimedDate }], [0, null]]
  ];
  test.each(singleCodeCases)("it should subtract amount_used and set calimed_date to null when amount is less than or equal to ", async (payload: FakeCode[], expected) => {
    findSpy.mockImplementation(() => Promise.resolve(payload));
    await clearCodeBlock({ codeRepository })({ codeIds: [1, 2], amount: 2.9 });
    expect(payload[0].amount_used).toEqual(expected[0]);
    expect(payload[0].claimed_date).toEqual(expected[1]);
  });

  it("should handle multiple codes with amount", async () => {
    const codes = [
      { amount_used: 5, claimed_date: claimedDate },
      { amount_used: 3, claimed_date: claimedDate },
      { amount_used: null, claimed_date: claimedDate }
    ];
    findSpy.mockImplementation(() => Promise.resolve(codes));
    await clearCodeBlock({ codeRepository })({ codeIds: [1, 2], amount: 3.9 });
    expect(codes[0].amount_used).toEqual(1.1);
    expect(codes[0].claimed_date).toEqual(claimedDate);
    expect(codes[1].amount_used).toEqual(0);
    expect(codes[1].claimed_date).toEqual(null);
    expect(codes[2].amount_used).toEqual(0);
    expect(codes[2].claimed_date).toEqual(null);
  });

  it("should handle multiple codes without amount", async () => {
    const codes = [
      { amount_used: 2, claimed_date: claimedDate, program: { type: VoucherType.PER_DIEM } },
      { amount_used: 1, claimed_date: claimedDate, program: { type: VoucherType.PRE_FIXE } },
      { amount_used: 3, claimed_date: claimedDate, program: { type: VoucherType.DISCOUNT } }
    ];
    findSpy.mockImplementation(() => Promise.resolve(codes));
    await clearCodeBlock({ codeRepository })({ codeIds: [1, 2] });
    expect(codes[0].amount_used).toEqual(0.00);
    expect(codes[0].claimed_date).toEqual(null);
    expect(codes[1].amount_used).toEqual(0.00);
    expect(codes[1].claimed_date).toEqual(null);
    expect(codes[2].amount_used).toEqual(0.00);
    expect(codes[2].claimed_date).toEqual(null);
  });
});
