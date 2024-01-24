import {
  BaseFilter, clearDatabase, getTestConnection, parsePaginationParam, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import getCodes, { ICodeFilter } from "../get-codes";
import getByCode from "../get-by-code";
import { VoucherType } from "@butlerhospitality/shared";
import Code, { CodeStatus } from "../../entities/code";
import { ICodeRepository } from "../../repository";

describe("get multiple codes", () => {
  let orm: MikroORM;
  let codeRepository: ICodeRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    codeRepository = orm.em.getRepository(Code);
  });

  const validateOutput = (codes: Code[], hotelId: number, filters: ICodeFilter) => {
    const { status } = filters;
    expect(codes.length).toBeTruthy();
    codes.forEach((item: Code) => {
      expect(item.hotel.id).toBe(hotelId);
      if (filters.name) {
        expect(item.code + item.program.name).toContain(filters.name);
      }
      if (
        filters.programTypes &&
        filters.programTypes.length !== 0
      ) {
        expect(filters.programTypes).toContain(item.program.type);
      }
      if (filters.fromDate) {
        expect(item.created_at.getTime()).toBeGreaterThanOrEqual(Date.parse(filters.fromDate.toString()));
      }
      if (filters.toDate) expect(item.created_at.getTime()).toBeLessThanOrEqual(Date.parse(filters.toDate.toString()));
      if (status === CodeStatus.PENDING) expect(item.claimed_date).toBe(null);
      if (status === CodeStatus.REDEEMED) expect(item.claimed_date).toBeDefined();
    });
  };

  it("should get codes with default pagination", async () => {
    const hotelId = 1;
    const [codes] = await getCodes({ codeRepository })({
      ...parsePaginationParam({
        page: undefined,
        limit: undefined
      })
    }, hotelId);
    expect(codes.length).toBeTruthy();
    expect(codes.length).toBeLessThanOrEqual(10);
  });

  it("should get the codes with pagination and populated programs", async () => {
    const hotelId = 1;
    const filters: BaseFilter = {
      limit: 20,
      page: 1
    };
    const [codes, count] = await getCodes({ codeRepository })({ ...parsePaginationParam(filters) }, hotelId);
    expect(codes.length).toBeTruthy();
    expect(count).toBeGreaterThanOrEqual(codes.length);
  });

  it("should get codes with filters of type DISCOUNT and search for 'XYXY'", async () => {
    const hotelId = 1;
    const filters: ICodeFilter = {
      limit: 10,
      page: 1,
      name: "XYXY",
      programTypes: [VoucherType.DISCOUNT],
      fromDate: new Date("2021-02-23T08:55:48.953Z"),
      toDate: new Date("2023-02-23T08:55:48.953Z")
    };

    const [codes] = await getCodes({ codeRepository })({ ...filters }, hotelId);
    validateOutput(codes, hotelId, filters);
  });

  it("should get codes with filters of type DISCOUNT and search for '3'", async () => {
    const hotelId = 1;
    const filters: ICodeFilter = {
      limit: 10,
      page: 1,
      name: "3",
      programTypes: [VoucherType.DISCOUNT],
      fromDate: new Date("2021-02-23T08:55:48.953Z"),
      toDate: new Date("2023-02-23T08:55:48.953Z")
    };

    const [codes] = await getCodes({ codeRepository })({ ...filters }, hotelId);
    validateOutput(codes, hotelId, filters);
  });

  it("should get codes with filters of type PER_DIEM and status PENDING", async () => {
    const hotelId = 2;
    const filters: ICodeFilter = {
      limit: 10,
      page: 1,
      programTypes: [VoucherType.PER_DIEM, VoucherType.DISCOUNT],
      fromDate: new Date("2021-02-23T08:55:48.953Z"),
      toDate: new Date("2023-02-23T08:55:48.953Z"),
      status: CodeStatus.PENDING
    };

    const [codes] = await getCodes({ codeRepository })({ ...filters }, hotelId);
    validateOutput(codes, hotelId, filters);
  });

  it("should get Code by code parameter", async () => {
    const code = "XYXY1";
    const result = await getByCode({ codeRepository })(code);
    expect(result).toBeTruthy();
    expect(result.code).toEqual(code);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
