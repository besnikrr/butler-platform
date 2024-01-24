
import { clearDatabase, getTestConnection, seedDatabase } from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import Program, { ProgramStatus } from "../../entities/program";
import batchEditStatus, { IEditStatusInput } from "../batch-edit-status";
import { IProgramRepository } from "../../repository";

describe("create program", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
  });

  const validatePrograms = (programs: Program[], active: boolean) => {
    programs.forEach((program) => {
      expect(program.status).toBe(active ? ProgramStatus.ACTIVE : ProgramStatus.INACTIVE);
    });
  };

  it("should activate multiple programs", async () => {
    const programData: IEditStatusInput = {
      activate: true,
      ids: [4, 5, 6]
    };
    const programs = await batchEditStatus({ programRepository })(programData);
    const requestedPrograms = await programRepository.find({ id: programData.ids });
    expect(programs).toBeDefined();
    expect(programs.length).toBe(requestedPrograms.length);
    validatePrograms(programs, programData.activate);
  });

  it("should deactivate multiple programs", async () => {
    const programData: IEditStatusInput = {
      activate: false,
      ids: [5, 6, 7]
    };
    const programs = await batchEditStatus({ programRepository })(programData);
    const requestedPrograms = await programRepository.find({ id: programData.ids });
    expect(programs).toBeDefined();
    expect(programs.length).toBe(requestedPrograms.length);
    validatePrograms(programs, programData.activate);
  });

  it("should activate multiple programs and return only existing programs", async () => {
    const programData: IEditStatusInput = {
      activate: true,
      ids: [5, 6, 99]
    };
    const programs = await batchEditStatus({ programRepository })(programData);
    const requestedPrograms = await programRepository.find({ id: programData.ids });
    expect(programs).toBeDefined();
    expect(programs.length).toBe(requestedPrograms.length);
    validatePrograms(programs, programData.activate);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
