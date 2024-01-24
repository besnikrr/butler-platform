import ProductMenu from "../entities/product-menu";
import Product from "../../product/entities/product";
import { BadRequestError } from "@butlerhospitality/service-sdk";
import { IProduct } from "./validate-products";

const validateProductPrice = (
  productMenu: ProductMenu,
  product: Product,
  input: IProduct) => {
  const productPrice = productMenu.price ?? product.price;

  if (productPrice !== input.price) {
    throw new BadRequestError(`Product '${product.name}' has an invalid price.`);
  }
};

export const validateProductName = (
  product: Product,
  input: IProduct
) => {
  if (product.name !== input.name) {
    throw new BadRequestError(`Product '${product.name}' has an invalid name.`);
  }
};

export const validateProductCategory = (
  product: Product,
  input: IProduct
) => {
  const productName = product.name;
  const productCategoryName = input.categoryName;
  const category = product.categories.getItems().find((item) => item.id === input.categoryId);

  if (!category) {
    throw new BadRequestError(`Category '${productCategoryName}' does not exist or does not belong to product '${productName}'`);
  }

  if (category.name !== productCategoryName) {
    throw new BadRequestError(`Category '${productCategoryName}' has an invalid name.`);
  }

  if (!category.parent_category) {
    throw new BadRequestError(`Category '${productCategoryName}' can not be a parent category.`);
  }

  if (category.start_date && category.start_date.getTime() > new Date().getTime()) {
    throw new BadRequestError(`
      Category '${productCategoryName}' is not available yet.
    `);
  }

  if (category.end_date && category.end_date.getTime() < new Date().getTime()) {
    throw new BadRequestError(`
      Category '${productCategoryName}' is not available anymore.
    `);
  }
};

export const validateProductMenuAndPrice = (
  product: Product,
  input: IProduct,
  menuId: number
) => {
  const productMenuIds = [];

  for (const productItem of product.productItems) {
    if (productItem.menu.id === menuId) {
      validateProductPrice(productItem, product, input);
      productMenuIds[productItem.menu.id] = true;
    }
  }

  if (!productMenuIds[menuId]) {
    throw new BadRequestError(`Product '${product.name}' is not in menu.`);
  }
};
export const validateProductOutOfStock = (product: Product, hubId: number) => {
  for (const outOfStock of product.out_of_stock) {
    if (outOfStock.hub_id === hubId) {
      throw new BadRequestError(`Product '${product.name}' is currently out of stock.`);
    }
  }
};

export const validateProductModifiers = (product: Product, input: IProduct) => {
  const productModifiersIds = [];
  product.modifiers.getItems().forEach((modifier, indexModifier) => {
    productModifiersIds[indexModifier] = modifier.options.getItems().map((option) => option.id);
  });

  if (!(input.options.every((r) => [].concat(...productModifiersIds).includes(r)))) {
    throw new BadRequestError(`Product '${product.name}' has invalid modifier options.`);
  }
};
