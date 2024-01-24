import Category from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface IGetCategoryDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: IGetCategoryDependency) => {
  const { categoryRepository } = dependency;
  return async (id: number): Promise<Category> => {
    return categoryRepository.getOneEntityOrFail(
      { id }, ["subcategories.parent_category", "parent_category"]
    );
  };
};
