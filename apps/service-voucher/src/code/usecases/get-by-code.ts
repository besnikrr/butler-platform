import { NotFoundError } from "@butlerhospitality/service-sdk";
import Code from "../entities/code";
import { ICodeRepository } from "../repository";

export interface IGetCodesDependency {
  codeRepository: ICodeRepository;
}

export class CodeNotFound extends NotFoundError {
  constructor() {
    super("Code", "Code not found");
  }
}

export default (dependency: IGetCodesDependency) => {
  const { codeRepository } = dependency;
  return async (codeFilter: string): Promise<Code> => {
    const code = await codeRepository.getOneEntityOrFail(
      { code: { $ilike: codeFilter } }, ["program.rules.categories.parent_category"]
    );
    return { ...code, program: { ...code.program } };
  };
};
