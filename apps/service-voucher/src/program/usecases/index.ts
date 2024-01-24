import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import create, { ICreateProgramInput } from "./create-program";
import getSingle from "./get-program";
import update, { IUpdateProgramInput } from "./update-program";
import getMultipleByHotel, { IHotelProgramFilter } from "./get-programs-by-hotel";
import deleteProgram from "./delete-program";
import batchEditStatus, { IEditStatusInput } from "./batch-edit-status";
import Program, { IProgram } from "../entities/program";
import Hotel from "../../hotel/entities/hotel";
import Rule from "../../rule/entities/rule";
import Category from "../../category/entities/category";
import { IRuleRepository } from "../../rule/repository";
import { IHotelRepository } from "../../hotel/repository";
import { IProgramRepository } from "../repository";
import { ICategoryRepository } from "../../category/repository";

export interface ProgramUsecase {
  getSingle(id: number): Promise<Program>;
  create(program: ICreateProgramInput): Promise<IProgram>;
  update(id: number, data: IUpdateProgramInput): Promise<IProgram>;
  deleteProgram(id: number): Promise<Program>;
  getMultipleByHotel(filters: IHotelProgramFilter, id: number): Promise<[Program[], number]>;
  batchEditStatus(data: IEditStatusInput): Promise<Program[]>;
}

export default (dependency: IDefaultUsecaseDependency): ProgramUsecase => {
  const { conn } = dependency;

  return {
    getSingle: getSingle({
      programRepository: conn.em.getRepository(Program) as IProgramRepository
    }),
    create: create({
      hotelRepository: conn.em.getRepository(Hotel) as IHotelRepository,
      programRepository: conn.em.getRepository(Program) as IProgramRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository
    }),
    update: update({
      programRepository: conn.em.getRepository(Program) as IProgramRepository,
      ruleRepository: conn.em.getRepository(Rule) as IRuleRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository
    }),
    deleteProgram: deleteProgram({
      programRepository: conn.em.getRepository(Program) as IProgramRepository
    }),
    getMultipleByHotel: getMultipleByHotel({
      programRepository: conn.em.getRepository(Program) as IProgramRepository
    }),
    batchEditStatus: batchEditStatus({
      programRepository: conn.em.getRepository(Program) as IProgramRepository
    })
  };
};
