import {
  parsePaginationParam, clearDatabase, getTestConnection, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import { VoucherType } from "@butlerhospitality/shared";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import Program, { ProgramStatus } from "../../entities/program";
import { IProgramRepository } from "../../repository";
import getProgramsByHotel, { IHotelProgramFilter } from "../get-programs-by-hotel";

const validateOutput = (programs: Program[], hotelId: number, filters: IHotelProgramFilter): void => {
  programs.forEach((item: Program) => {
    expect(item.hotels[0].id).toBe(hotelId);
    if (filters.programName) expect(item.name).toContain(filters.programName);
    if (filters.programTypes) expect(filters.programTypes).toContain(item.type);
    if (filters.statuses) expect(filters.statuses).toContain(item.status);
  });
};

describe("should get programs by hotel id", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
  });

  it("should get the programs with default pagination for specific hotel", async () => {
    const filters: IHotelProgramFilter = {
      ...parsePaginationParam({ page: undefined, limit: undefined }),
      populate: ["hotels"]
    };
    const [programs] = await getProgramsByHotel({ programRepository })(filters, 1);
    expect(programs.length).toBeTruthy();
    expect(programs.length).toBeLessThanOrEqual(10);
  });

  it("should get the programs with pagination and type discount or pre_fixe", async () => {
    const filters: IHotelProgramFilter = {
      programTypes: [VoucherType.DISCOUNT, VoucherType.PRE_FIXE],
      ...parsePaginationParam({ page: 1, limit: 10 }),
      populate: ["hotels"]
    };

    const [programs] = await getProgramsByHotel({ programRepository })(filters, 1);
    expect(programs.length).toBeTruthy();
    expect(programs.length).toBeLessThanOrEqual(filters.limit);
    validateOutput(programs, 1, filters);
  });

  it("should get the programs with default pagination and status active", async () => {
    const filters: IHotelProgramFilter = {
      statuses: [ProgramStatus.ACTIVE],
      ...parsePaginationParam({ page: undefined, limit: undefined }),
      populate: ["hotels"]
    };
    const [programs] = await getProgramsByHotel({ programRepository })(filters, 1);
    expect(programs.length).toBeTruthy();
    expect(programs.length).toBeLessThanOrEqual(filters.limit);
    validateOutput(programs, 1, filters);
  });

  it("should get the programs with default pagination and status inactive", async () => {
    const filters: IHotelProgramFilter = {
      statuses: [ProgramStatus.INACTIVE],
      ...parsePaginationParam({ page: undefined, limit: undefined }),
      populate: ["hotels"]
    };
    const [programs] = await getProgramsByHotel({ programRepository })(filters, 1);
    expect(programs.length).toBeTruthy();
    expect(programs.length).toBeLessThanOrEqual(filters.limit);
    validateOutput(programs, 1, filters);
  });

  it("should get the programs with default pagination and status inactive and contain word '5'", async () => {
    const filters: IHotelProgramFilter = {
      statuses: [ProgramStatus.INACTIVE],
      programName: "5",
      ...parsePaginationParam({ page: undefined, limit: undefined }),
      populate: ["hotels"]
    };
    const [programs] = await getProgramsByHotel({ programRepository })(filters, 1);
    expect(programs.length).toBeTruthy();
    expect(programs.length).toBeLessThanOrEqual(filters.limit);
    validateOutput(programs, 1, filters);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
