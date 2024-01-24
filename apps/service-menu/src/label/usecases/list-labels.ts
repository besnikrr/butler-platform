import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FilterQuery, FindOptions, QueryOrder } from "@mikro-orm/core";
import Label, { ILabel } from "../entities/label";
import { ILabelRepository } from "../repository";

export interface IListLabelDependency {
  labelRepository: ILabelRepository;
}

export interface LabelFilter extends BaseFilter {
  name?: string
}

export default (dependency: IListLabelDependency) => {
  const { labelRepository } = dependency;

  return async (filters: LabelFilter): Promise<[ILabel[], number]> => {
    const options: FindOptions<Label> = {
      offset: (filters.page - 1) * filters.limit,
      limit: filters.limit,
      orderBy: {
        name: QueryOrder.ASC
      },
      populate: ["products"]
    };

    const where: FilterQuery<Label> = {
      ...(filters.name && {
        name: {
          $ilike: `%${filters.name.trim()}%`
        }
      })
    };

    return labelRepository.findAndCount(where, options);
  };
};
