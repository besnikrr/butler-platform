import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";

interface HubUsecase {
}

export default (dependency: IDefaultUsecaseDependency): HubUsecase => {
  const { conn } = dependency;

  return {

  };
};
