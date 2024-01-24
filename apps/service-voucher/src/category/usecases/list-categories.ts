import Category from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface IListCategoriesDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: IListCategoriesDependency) => {
  const { categoryRepository } = dependency;
  return async (): Promise<[Category[], number]> => {
    return categoryRepository.findAndCount(
      { parent_category: null }, { populate: ["sub_categories"], filters: ["ongoing"] }
    );
  };
};
