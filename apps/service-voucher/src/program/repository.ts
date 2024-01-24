
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Program from "./entities/program";

export interface IProgramRepository extends CustomEntityRepository<Program> {}
export class ProgramRepository extends CustomEntityRepository<Program> implements IProgramRepository {}
