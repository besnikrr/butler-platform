
import {
  BadRequestError, clearDatabase, getTestConnection, NotFoundError, seedDatabase
} from "@butlerhospitality/service-sdk";
import { AmountType, VoucherType } from "@butlerhospitality/shared";
import { MikroORM } from "@mikro-orm/core";
import * as path from "path";
import { IHotelRepository } from "apps/service-voucher/src/hotel/repository";
import { ICategoryRepository } from "apps/service-voucher/src/category/repository";
import Category from "../../../category/entities/category";
import Hotel from "../../../hotel/entities/hotel";
import Program, { ProgramStatus } from "../../entities/program";
import create, { ICreateProgramInput } from "../create-program";
import { VoucherEntities } from "../../../entities";
import { IProgramRepository } from "../../repository";

describe("create program", () => {
  let orm: MikroORM;
  let programRepository: IProgramRepository;
  let hotelRepository: IHotelRepository;
  let categoryRepository: ICategoryRepository;
  beforeAll(async () => {
    orm = await getTestConnection(process.env.TEST_DB, VoucherEntities.asArray());
    await seedDatabase(orm, path.join(__dirname, "..", "..", "..", ".."));
    programRepository = orm.em.getRepository(Program);
    hotelRepository = orm.em.getRepository(Hotel);
    categoryRepository = orm.em.getRepository(Category);
  });

  const validateProgramFields = (data, entity) => {
    for (const [key] of Object.entries(data)) {
      if (Array.isArray(data[key])) {
        expect(data[key].length).toBe(entity[key].length);
      } else if (!key.endsWith("id")) {
        expect(data[key]).toBe(entity[key]);
      }
    }
  };

  it("should create discount program", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.DISCOUNT,
      description: "Program notes"
    };
    const program = await create({ hotelRepository, programRepository, categoryRepository })(programData);
    expect(program).toBeDefined();
    validateProgramFields(programData, program);
  });

  it("should create per_diem program", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.FIXED,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PER_DIEM,
      description: "Program notes"
    };
    const program = await create({ hotelRepository, programRepository, categoryRepository })(programData);
    expect(program).toBeDefined();
    validateProgramFields(programData, program);
  });

  it("should create PRE_FIXE voucher program", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.FIXED,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program prefixe",
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

    const program = await create({ hotelRepository, programRepository, categoryRepository })(programData);
    expect(program).toBeDefined();
    validateProgramFields(programData, program);
  });

  it("should create per_diem program with fixed amount type", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PER_DIEM,
      description: "Program notes"
    };

    const program = await create({ hotelRepository, programRepository, categoryRepository })(programData);
    expect(program).toBeDefined();
    validateProgramFields({ ...programData, amount_type: AmountType.FIXED }, program);
  });

  it("should create PRE_FIXE voucher program with fixed amount type", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program prefixe",
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

    const program = await create({ hotelRepository, programRepository, categoryRepository })(programData);
    expect(program).toBeDefined();
    validateProgramFields({ ...programData, amount_type: AmountType.FIXED }, program);
  });

  it("should throw an error because of empty rules", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PRE_FIXE,
      rules: []
    };

    await expect(async () => {
      await create({ hotelRepository, programRepository, categoryRepository })(programData);
    }).rejects.toThrowError(BadRequestError);
  });

  it("should throw an error when passing a non-existing category.", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PRE_FIXE,
      rules: [
        {
          categories: [-1],
          max_price: 10,
          quantity: 2
        },
        {
          categories: [1, 2],
          max_price: 10,
          quantity: 2
        }
      ]
    };

    await expect(async () => {
      await create({ hotelRepository, programRepository, categoryRepository })(programData);
    }).rejects.toThrowError(NotFoundError);
  });

  it("should throw an error when passing subcategory of a different parent category.", async () => {
    const programData: ICreateProgramInput = {
      amount: 10,
      amount_type: AmountType.PERCENTAGE,
      code_limit: 100,
      hotel_id: 1,
      name: "Test Program 000",
      payer: "BUTLER",
      payer_percentage: 100,
      status: ProgramStatus.ACTIVE,
      type: VoucherType.PRE_FIXE,
      rules: [
        {
          categories: [4, 3],
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

    await expect(async () => {
      await create({ hotelRepository, programRepository, categoryRepository })(programData);
    }).rejects.toThrowError(BadRequestError);
  });

  afterAll(async () => {
    await clearDatabase(orm);
    await orm?.close(true);
  });
});
