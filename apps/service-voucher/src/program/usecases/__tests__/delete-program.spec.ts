import {
  clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { VoucherEntities } from "../../../entities";
import Program from "../../entities/program";
import deleteProgram from "../delete-program";
import { IProgramRepository } from "../../repository";

describe("delete programs", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
  });

  it("should delete the program", async () => {
    const deletedProgram = await deleteProgram({ programRepository })(8);
    expect(deletedProgram.deleted_at).not.toBeNull();
  });

  it("Should throw not found error", async () => {
    expect(async () => {
      await deleteProgram({ programRepository })(-1);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
