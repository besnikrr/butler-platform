
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Code from "./entities/code";

export interface ICodeRepository extends CustomEntityRepository<Code> {}
export class CodeRepository extends CustomEntityRepository<Code> implements ICodeRepository {}
