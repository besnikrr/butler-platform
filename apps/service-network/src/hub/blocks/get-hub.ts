import { IHubRepository } from "@services/service-network/src/hub/repository";

export interface IGetHubDependency {
  hubRepository: IHubRepository;
}

export default (dependency: IGetHubDependency) => {
  return async (id: number) => {
    return await dependency.hubRepository.findOne({ id });
  };
};
