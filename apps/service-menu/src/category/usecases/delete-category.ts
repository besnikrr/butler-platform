import Category, { IOnDeleteCategoryPublish } from "../entities/category";
import { ICategoryRepository } from "../repository";
import { eventDataDeleteCategory } from "../../utils/util";
import { eventProvider } from "@butlerhospitality/service-sdk";
import { SNS_TOPIC, CATEGORY_EVENT } from "@butlerhospitality/shared";
export interface IDeleteCategoryDependency {
  categoryRepository: ICategoryRepository;
}

export default (dependency: IDeleteCategoryDependency) => {
  const { categoryRepository } = dependency;
  return async (id: number): Promise<Category> => {
    const category = await categoryRepository.getOneEntityOrFail(id);
    if (!category.parent_category) {
      await categoryRepository
        .populate(category, ["subcategories", "subcategories.menuProducts", "subcategories.items"] );
    } else {
      await categoryRepository.populate(category, ["menuProducts", "items"] );
    }

    const eventData = eventDataDeleteCategory(category, id);
    let categoriesToDelete = [];
    if (!category.parent_category) {
      for (const subCategory of category.subcategories) {
        subCategory.menuProducts.removeAll();
        const products = await subCategory.items.init(["categories"]);
        for (const product of products) {
          product.categories.remove(subCategory);
        }
      }
      categoriesToDelete = category.subcategories.toArray().map((e) => e.id);
    } else {
      category.menuProducts.removeAll();
      const products = await category.items.init(["categories"]);
      for (const product of products) {
        product.categories.remove(category);
      }
    }
    categoriesToDelete.push(id);

    await categoryRepository.softDelete(categoriesToDelete);

    await eventProvider.client().publish<IOnDeleteCategoryPublish>(
      SNS_TOPIC.MENU.CATEGORY, CATEGORY_EVENT.DELETED, null, eventData);

    return category;
  };
};
