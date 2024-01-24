import { EntityManager } from "@mikro-orm/postgresql";
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import getCategory from "./get-category";
import listCategories, { ICategoryFilter } from "./list-categories";
import createCategory, { ICreateCategoryInput } from "./create-category";
import updateCategory, { IUpdateCategoryInput } from "./update-category";
import deleteCategory from "./delete-category";
import getCategoryRelations from "./list-category-relations";
import Category from "../entities/category";

export interface CategoryUsecase {
  getCategory(id: number): Promise<Category>;
  listCategories(filterParams: ICategoryFilter): Promise<[Category[], number]>;
  createCategory(category: ICreateCategoryInput): Promise<Category>;
  updateCategory(id: number, category: IUpdateCategoryInput): Promise<Category>;
  deleteCategory(id: number): Promise<Category>;
  getCategoryRelations(id: number): Promise<any>;
}

export default (dependency: IDefaultUsecaseDependency): CategoryUsecase => {
  const { conn } = dependency;
  return {
    createCategory: createCategory({
      categoryRepository: conn.em.getRepository(Category)
    }),
    updateCategory: updateCategory({
      categoryRepository: conn.em.getRepository(Category)
    }),
    listCategories: listCategories({
      categoryRepository: conn.em.getRepository(Category)
    }),
    getCategory: getCategory({
      categoryRepository: conn.em.getRepository(Category)
    }),
    deleteCategory: deleteCategory({
      categoryRepository: conn.em.getRepository(Category)
    }),
    getCategoryRelations: getCategoryRelations({
      knex: (conn.em as EntityManager).getKnex()
    })
  };
};
