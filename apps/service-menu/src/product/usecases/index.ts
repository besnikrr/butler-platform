import { EntityManager } from "@mikro-orm/postgresql";
import { IDefaultUsecaseDependency } from "@butlerhospitality/shared";
import createProduct, { ICreateProductInput } from "./create-product";
import updateProduct, {
  IUpdateProductInformationInput,
  IUpdateProductCategoriesInput,
  IUpdateProductModifiersInput
} from "./update-product";
import listProducts, { IProductFilter } from "./list-products";
import getProduct from "./get-product";
import listProductRelations from "./list-product-relations";
import deleteProduct from "./delete-product";
import takeProductOutOfStock, { IOutOfStockInput } from "./take-product-out-of-stock";
import batchEditProductStatus, { IBatchEditProductStatusInput } from "./batch-edit-status";
import Product from "../entities/product";
import Category from "../../category/entities/category";
import Modifier from "../../modifier/entities/modifier";
import ProductMenu from "../../menu/entities/product-menu";
import Hub from "../../hub/entities/hub";
import { IOutOfStockRepository, IProductRepository } from "../repository";
import OutOfStock from "../entities/out-of-stock";
import { IHubRepository } from "../../hub/repository";
import { IModifierRepository } from "../../modifier/repository";
import { ICategoryRepository } from "../../category/repository";
import { IMenuRepository, IProductMenuRepository } from "../../menu/repository";
import Menu from "../../menu/entities/menu";
import Label from "../../label/entities/label";
import { ILabelRepository } from "../../label/repository";

export interface ProductUsecase {
  createProduct(product: ICreateProductInput): Promise<Product>;
  updateProduct(
    id: number,
    updateType: string,
    product: IUpdateProductInformationInput | IUpdateProductCategoriesInput | IUpdateProductModifiersInput
  ): Promise<Product>;
  listProducts(filterParams: IProductFilter): Promise<[Product[] | Category[], number]>;
  getProduct(id: number): Promise<Product>;
  deleteProduct(id: number): Promise<boolean>;
  listProductRelations(id: number): Promise<any>;
  takeProductOutOfStock(id: number, input: IOutOfStockInput): Promise<OutOfStock[]>;
  batchEditProductStatus(data: IBatchEditProductStatusInput): Promise<Product[]>;
}

export default (dependency: IDefaultUsecaseDependency): ProductUsecase => {
  const { conn } = dependency;
  return {
    getProduct: getProduct({
      productRepository: conn.em.getRepository(Product) as IProductRepository
    }),
    listProducts: listProducts({
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository
    }),
    createProduct: createProduct({
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository,
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository,
      labelRepository: conn.em.getRepository(Label) as ILabelRepository
    }),
    updateProduct: updateProduct({
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository,
      categoryRepository: conn.em.getRepository(Category) as ICategoryRepository,
      modifierRepository: conn.em.getRepository(Modifier) as IModifierRepository,
      menuRepository: conn.em.getRepository(Menu) as IMenuRepository,
      labelRepository: conn.em.getRepository(Label) as ILabelRepository
    }),
    deleteProduct: deleteProduct({
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    }),
    listProductRelations: listProductRelations({
      knex: (conn.em as EntityManager).getKnex()
    }),
    takeProductOutOfStock: takeProductOutOfStock({
      outOfStockRepository: conn.em.getRepository(OutOfStock) as IOutOfStockRepository,
      hubRepository: conn.em.getRepository(Hub) as IHubRepository
    }),
    batchEditProductStatus: batchEditProductStatus({
      productRepository: conn.em.getRepository(Product) as IProductRepository,
      productMenuRepository: conn.em.getRepository(ProductMenu) as IProductMenuRepository
    })
  };
};
