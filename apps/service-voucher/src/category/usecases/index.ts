import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import listCategories from "./list-categories";
import Category from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface CategoryUsecase {
  listCategories(): Promise<[Category[], number]>;
}

export default (dependency: IDefaultUsecaseDependency): CategoryUsecase => {
  const { conn } = dependency;
  return {
    listCategories: listCategories({
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository
    })
  };
};
