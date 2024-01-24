import { BadRequestError, CustomEntityRepository, NotFoundError } from "@butlerhospitality/service-sdk";
import { AmountType, VoucherType } from "@butlerhospitality/shared";
import Category from "../category/entities/category";
import { ICreateRuleInput } from "../program/usecases/create-program";

export const validateAmountType = (programType: VoucherType, amountType: AmountType): AmountType => {
  return programType !== VoucherType.DISCOUNT ? AmountType.FIXED : amountType;
};

export const validateCategories = (categoryRepository: CustomEntityRepository<Category>) => {
  return async (rules: ICreateRuleInput[], parent_category?: number): Promise<void> => {
    if (rules === undefined || rules.length === 0) {
      throw new BadRequestError("Empty rules received!");
    }
    const categoryIds: Set<number> = new Set();
    rules.forEach((rule: ICreateRuleInput) => {
      rule.categories.forEach((categoryId: number) => {
        categoryIds.add(+categoryId);
      });
    });
    const categories = await categoryRepository.find({
      id: { $in: [...categoryIds] },
      parent_category: { $ne: null }
    }, { populate: ["parent_category"] });
    if (categories.length === categoryIds.size) {
      const parentCategoryId = parent_category || categories[0].parent_category.id;
      categories.forEach((c) => {
        if (c.parent_category.id !== parentCategoryId) {
          throw new BadRequestError("Wrong categories provided!");
        }
      });
    } else {
      throw new NotFoundError("Category", "Subcategories for PRE_FIXE type don't exist");
    }
  };
};
