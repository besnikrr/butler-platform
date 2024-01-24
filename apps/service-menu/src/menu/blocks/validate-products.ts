import { MikroORM } from "@mikro-orm/core";
import Product from "../../product/entities/product";
import { IProductRepository } from "../../product/repository";
import { BadRequestError } from "@butlerhospitality/service-sdk";
import {
  validateProductModifiers,
  validateProductOutOfStock,
  validateProductMenuAndPrice,
  validateProductName,
  validateProductCategory
} from "./util";
export interface IGetMenuProductDependency {
  connection: MikroORM;
}

export interface IProduct {
  id?: number;
  productId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  options: number[];
  comment?: string;
  code?: string;
  codeId?: number;
  ruleId?: number;
}

export interface IGetMenuProductDependenciesInput {
  menuId: number;
  hubId: number;
  products: IProduct[];
}

export default (
  dependency: IGetMenuProductDependency
) => {
  return async (input: IGetMenuProductDependenciesInput): Promise<void> => {
    const productIds = input.products.map((product) => product.productId);
    const repo = dependency.connection.em.getRepository(Product) as IProductRepository;
    const products = await repo.getEntitiesOrFailIfNotFound(productIds,
      ["categories", "productItems", "out_of_stock", "modifiers", "modifiers.options"]
    );

    for (const product of products) {
      const productInput = input.products.find((p) => p.productId === product.id);

      if (product.categories.length === 0) {
        throw new BadRequestError(`Product '${product.name}' has no categories`);
      }

      validateProductName(product, productInput);

      validateProductCategory(product, productInput);

      validateProductMenuAndPrice(product, productInput, input.menuId);

      validateProductOutOfStock(product, input.hubId);

      validateProductModifiers(product, productInput);
    }
  };
};
