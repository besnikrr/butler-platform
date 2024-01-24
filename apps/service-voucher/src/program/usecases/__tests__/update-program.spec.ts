import {
  BadRequestError, clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { AmountType, VoucherType } from "@butlerhospitality/shared";
import * as path from "path";
import { MikroORM } from "@mikro-orm/core";
import { ICategoryRepository } from "apps/service-voucher/src/category/repository";
import { IRuleRepository } from "apps/service-voucher/src/rule/repository";
import Program, { ProgramStatus } from "../../entities/program";
import update, { IUpdateProgramInput } from "../update-program";
import getSingle from "../get-program";
import Category from "../../../category/entities/category";
import Rule from "../../../rule/entities/rule";
import { VoucherEntities } from "../../../entities";
import { IProgramRepository } from "../../repository";

describe("update program", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  let categoryRepository: ICategoryRepository;
  let ruleRepository: IRuleRepository;
  let currentProgram: Program;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
    categoryRepository = orm.em.getRepository(Category);
    ruleRepository = orm.em.getRepository(Rule);
    currentProgram = await getSingle({ programRepository })(5);
  });

  it("should update per_diem program", async () => {
    const programData: IUpdateProgramInput = {
      amount: 10,
      amount_type: AmountType.FIXED,
      code_limit: 100,
      name: "Test Program 000 updated",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PER_DIEM,
      description: "Program notes updated"
    };
    const program = await update({
      programRepository,
      ruleRepository,
      categoryRepository
    })(currentProgram.id, programData);
    expect(program).toBeDefined();
  });

  it("should update PRE_FIXE voucher program", async () => {
    const programData: IUpdateProgramInput = {
      amount: 30,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PRE_FIXE,
      rules: [
        {
          categories: [3, 4],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [3],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [4],
          max_price: 10,
          quantity: 2
        }
      ]
    };

    const program = await update({ programRepository, ruleRepository, categoryRepository })(3, programData);
    expect(program).toBeDefined();
    expect(program.amount_type).toBe(AmountType.FIXED);
  });

  it("should throw an error because of updated type", async () => {
    const programData: IUpdateProgramInput = {
      amount: 10,
      amount_type: null,
      code_limit: 100,
      name: "test update",
      payer: "BUTLER",
      status: null,
      type: VoucherType.PRE_FIXE,
      description: "Program notes"
    };

    await expect(async () => {
      await update({ programRepository, ruleRepository, categoryRepository })(currentProgram.id, programData);
    }).rejects.toThrowError(BadRequestError);
  });

  it("should throw an error because of empty rules", async () => {
    const programData: IUpdateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PRE_FIXE,
      rules: []
    };

    expect(async () => {
      await update({ programRepository, ruleRepository, categoryRepository })(currentProgram.id, programData);
    }).rejects.toThrowError(BadRequestError);
  });

  it("should throw an error when passing a non-existing category.", async () => {
    const programData: IUpdateProgramInput = {
      amount: 10,
      code_limit: 100,
      name: "Test Program 000",
      payer: "BUTLER",
      type: VoucherType.PRE_FIXE,
      payer_percentage: 100,
      rules: [
        {
          categories: [3, 4],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [-1],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [5, 6],
          max_price: 10,
          quantity: 2
        }
      ]
    };

    expect(async () => {
      await update({ programRepository, ruleRepository, categoryRepository })(-1, programData);
    }).rejects.toThrowError(NotFoundError);
  });

  it("should throw an error when passing subcategories of a different category.", async () => {
    const programData: IUpdateProgramInput = {
      amount: 10,
      code_limit: 100,
      name: "Test Program 000",
      payer: "BUTLER",
      type: VoucherType.PRE_FIXE,
      payer_percentage: 100,
      rules: [
        {
          categories: [3, 4],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [5, 6],
          max_price: 10,
          quantity: 2
        }
      ]
    };

    expect(async () => {
      await update({ programRepository, ruleRepository, categoryRepository })(-1, programData);
    }).rejects.toThrowError(NotFoundError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
