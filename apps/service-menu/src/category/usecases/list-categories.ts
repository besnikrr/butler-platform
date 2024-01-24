import { BaseFilter, getPaginationParams } from "@butlerhospitality/service-sdk";
import { FilterQuery, FindOptions } from "@mikro-orm/core";
import Category from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface ICategoryFilter extends BaseFilter {
  grouped?: boolean;
  name?: string;
  type?: CategoryType[];
}

export enum CategoryType {
  subcategory = "subcategory",
  category = "category",
}

const parseTypeFilter = (type) => {
  return {
    ...(type.includes(CategoryType.category) &&
      !type.includes(CategoryType.subcategory) ?
      { parent_category_id: null } :
      !type.includes(CategoryType.category) &&
      type.includes(CategoryType.subcategory) && { parent_category_id: { $ne: null } })
  };
};

export interface IListCategoryDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: IListCategoryDependency) => {
  const { categoryRepository } = dependency;
  return async (filters: ICategoryFilter): Promise<[Category[], number]> => {
    const whereFilters: FilterQuery<Category> = filters.grouped ?
      { parent_category_id: null, subcategories: { $ne: null } } :
      {
        ...(filters.type && parseTypeFilter(filters.type)),
        ...(filters.name &&
            filters.name.trim() && {
          name: {
            $ilike: `%${filters.name}%`
          }
        })
      };

    const options: FindOptions<Category> = filters.grouped ?
      {
        populate: ["subcategories"]
      } :
      getPaginationParams(filters);

    return categoryRepository.findAndCount(whereFilters, options);
  };
};
