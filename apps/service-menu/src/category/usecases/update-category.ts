import {
  BadRequestError, IsBeforeDate, eventProvider
} from "@butlerhospitality/service-sdk";
import { wrap } from "@mikro-orm/core";
import {
  IsNumber, IsOptional, IsString, IsDateString, MaxLength
} from "class-validator";
import { CATEGORY_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Category, { ICategoryPublish } from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface IUpdateCategoryInput {
  oms_id?: number;
  name?: string;
  start_date?: Date;
  end_date?: Date;
  parent_category_id?: number;
}

export class UpdateCategoryInput implements IUpdateCategoryInput {
  @IsNumber()
  @IsOptional()
  oms_id?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  name: string;

  @IsBeforeDate("end_date")
  @IsDateString()
  @IsOptional()
  start_date: Date;

  @IsDateString()
  @IsOptional()
  end_date: Date;

  @IsNumber()
  @IsOptional()
  parent_category_id: number;
}
export interface IUpdateCategoryDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: IUpdateCategoryDependency) => {
  const { categoryRepository } = dependency;
  return async (id: number, data: IUpdateCategoryInput): Promise<Category> => {
    const category = await categoryRepository.getOneEntityOrFail({ id });

    if (data.parent_category_id && !category.parent_category_id) {
      throw new BadRequestError("Category can not be converted to a subcategory");
    }

    if (data.parent_category_id) {
      await categoryRepository.getOneEntityOrFail({
        id: data.parent_category_id,
        parent_category_id: null
      });
    }

    wrap(category).assign(data);

    await categoryRepository.flush();

    await eventProvider.client().publish<ICategoryPublish>(
      SNS_TOPIC.MENU.CATEGORY, CATEGORY_EVENT.UPDATED, null, {
        ...category,
        entity: ENTITY.MENU.CATEGORY
      }
    );

    return categoryRepository.populate(category, ["parent_category"]);
  };
};
