
import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Product from "./entities/product";
import OutOfStock from "./entities/out-of-stock";

export interface IProductRepository extends CustomEntityRepository<Product> {}
export class ProductRepository extends CustomEntityRepository<Product> implements IProductRepository {}

export interface IOutOfStockRepository extends CustomEntityRepository<OutOfStock> {}
export class OutOfStockRepository extends CustomEntityRepository<OutOfStock> implements IOutOfStockRepository {}
