import { ICodeRepository } from "@services/service-voucher/src/code/repository";

interface IGetCodeDependency {
  codeRepository: ICodeRepository;
}

export default (dependency: IGetCodeDependency) => {
  return async (orderId: number) => {
    return dependency.codeRepository.findOne({ order_id: orderId }, ["program"]);
  };
};
