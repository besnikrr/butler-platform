/* eslint-disable max-len */

import { CustomEntityRepository } from "@butlerhospitality/service-sdk";
import Category from "./entities/category";

export interface ICategoryRepository extends CustomEntityRepository<Category> {}
export class CategoryRepository extends CustomEntityRepository<Category> implements ICategoryRepository {}
