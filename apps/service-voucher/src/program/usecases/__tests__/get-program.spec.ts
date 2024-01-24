import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import Program from "../../entities/program";
import { IProgramRepository } from "../../repository";
import getSingle from "../get-program";

describe("get single program", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
  });

  it("should get the program with id", async () => {
    const program = await getSingle({ programRepository })(1);
    expect(program).toBeDefined();
    expect(program.id).toBe(1);
  });

  it("Should have rules", async () => {
    const program = await getSingle({ programRepository })(3);
    expect(program.rules.length).toBeTruthy();
  });

  it("Should throw not found error", async () => {
    await expect(async () => {
      await getSingle({ programRepository })(-1);
    }).rejects.toThrowError(NotFoundError);
  });
  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
