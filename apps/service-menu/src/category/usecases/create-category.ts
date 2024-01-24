import { BadRequestError, eventProvider, IsBeforeDate } from "@butlerhospitality/service-sdk";
import {
  IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, MaxLength
} from "class-validator";
import { CATEGORY_EVENT, ENTITY, SNS_TOPIC } from "@butlerhospitality/shared";
import Category, { ICategoryPublish } from "../entities/category";
import { ICategoryRepository } from "../repository";

export interface ICreateCategoryInput {
  name: string;
  start_date: Date;
  end_date: Date;
  parent_category_id?: number;
}

export class CreateCategoryInput implements ICreateCategoryInput {
  @IsString()
  @IsNotEmpty()
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

export interface ICreateCategoryDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: ICreateCategoryDependency) => {
  const { categoryRepository } = dependency;
  return async (data: ICreateCategoryInput): Promise<Category> => {
    await categoryRepository.failIfEntityExists({
      name: data.name,
      ...(data.parent_category_id && { parent_category_id: data.parent_category_id })
    });

    if (data.parent_category_id) {
      const parent = await categoryRepository.getOneEntityOrFail({ id: data.parent_category_id });
      if (parent.parent_category_id) {
        throw new BadRequestError("The parent of a sub category can not be a sub category itself");
      }
    }

    const category = categoryRepository.create(data);
    await categoryRepository.persistAndFlush(category);
    await eventProvider.client().publish<ICategoryPublish>(
      SNS_TOPIC.MENU.CATEGORY, CATEGORY_EVENT.CREATED_ADAPTER, null, {
        ...category,
        entity: ENTITY.MENU.CATEGORY
      }
    );

    return categoryRepository.populate(category, ["parent_category"]);
  };
};
