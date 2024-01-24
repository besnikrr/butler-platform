import { FindOptions } from "@mikro-orm/core";
import { BaseFilter } from "@butlerhospitality/service-sdk";
import Product from "../entities/product";
import { IProductRepository } from "../repository";
import { ICategoryRepository } from "../../category/repository";

export interface IProductFilter extends BaseFilter {
  categorized?: boolean;
  name?: string;
}

export interface IListProductsDependency {
  productRepository: IProductRepository;
  categoryRepository: ICategoryRepository;
}

export default (dependency: IListProductsDependency) => {
  const { productRepository, categoryRepository } = dependency;
  return async (filters: IProductFilter) => {
    const name = filters?.name?.trim();
    const whereFilters = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      })
    };

    const options: FindOptions<Product> = {
      offset: (filters.page - 1) * filters.limit,
      limit: filters.limit,
      populate: ["out_of_stock"]
    };

    if (filters.categorized) {
      return categoryRepository.findAndCount({}, { populate: ["subcategories.items"] });
    }

    return productRepository.findAndCount(whereFilters, options);
  };
};
