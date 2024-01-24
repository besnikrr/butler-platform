import { IHubRepository } from "../repository";

export interface IGetHubDependency {
  hubRepository: IHubRepository;
}

export default (dependency: IGetHubDependency) => {
  const { hubRepository } = dependency;
  return async (id: number) => {
    return hubRepository.getOneEntityOrFail({ id }, ["hotels", "city"]);
  };
};
