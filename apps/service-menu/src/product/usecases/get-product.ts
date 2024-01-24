import { IProductRepository } from "../repository";

export interface IGetProductDependency {
  productRepository: IProductRepository;
}

export default (dependency: IGetProductDependency) => {
  const { productRepository } = dependency;
  return async (id: number) => {
    return productRepository.getOneEntityOrFail(id, [
      "modifiers", "categories.parent_category", "out_of_stock.hub", "labels"
    ]);
  };
};
