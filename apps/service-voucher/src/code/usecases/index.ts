import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import { ICodeFilter } from "./get-codes";
import Code from "../entities/code";
import { ICodeRepository } from "../repository";
import getCode from "./get-code";
import getByCode from "./get-by-code";
import getCodes from "./get-codes";

export interface CodeUsecase {
  getCodes(filterParams: ICodeFilter, hotelId: number): Promise<[Code[], number]>;
  getByCode(code: string): Promise<Code>;
  getCode(id: number): Promise<Code>;
}

export default (dependency: IDefaultUsecaseDependency): CodeUsecase => {
  const { conn } = dependency;
  return {
    getCode: getCode({
      codeRepository: conn.em.getRepository(Code) as ICodeRepository
    }),
    getCodes: getCodes({
      codeRepository: conn.em.getRepository(Code) as ICodeRepository
    }),
    getByCode: getByCode({
      codeRepository: conn.em.getRepository(Code) as ICodeRepository
    })
  };
};
