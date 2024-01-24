import { EntityRepository } from "@mikro-orm/core";
import Code from "@services/service-voucher/src/code/entities/code";

interface IFetchCodesDependency {
  codeRepository: EntityRepository<Code>;
}

export default (dependency: IFetchCodesDependency) => {
  return async (codeIds: number[]) => {
    return dependency.codeRepository.find(codeIds, ["program"]);
  };
};
