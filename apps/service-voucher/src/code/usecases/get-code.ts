import Code from "../entities/code";
import { ICodeRepository } from "../repository";

export interface IGetVoucherCodeDependency {
  codeRepository: ICodeRepository;
}
export default (dependency: IGetVoucherCodeDependency) => {
  const { codeRepository } = dependency;

  return async (id: number): Promise<Code> => {
    return codeRepository.getOneEntityOrFail(id, ["program.rules"]);
  };
};
