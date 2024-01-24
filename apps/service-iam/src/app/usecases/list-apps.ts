import App from "../entities/app";
import { AppRepository } from "../repository";

export interface IListAppsDependency {
  appRepository: AppRepository;
}

export default (dependency: IListAppsDependency) => {
  const { appRepository } = dependency;
  return async (): Promise<[App[], number]> => {
    return appRepository.findAndCount({});
  };
};
