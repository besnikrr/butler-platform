import { BaseFilter } from "@butlerhospitality/service-sdk";
import { FindOptions, QueryOrder, FilterQuery } from "@mikro-orm/core";
import Modifier from "../entities/modifier";
import { IModifierRepository } from "../repository";

export interface ModifierFilter extends BaseFilter {
  name?: string;
}

export interface IListModifierDependency {
  modifierRepository: IModifierRepository;
}

export default (dependency: IListModifierDependency) => {
  const { modifierRepository } = dependency;
  return async (filterOptions: ModifierFilter) => {
    const name = filterOptions?.name?.trim();
    const where: FilterQuery<Modifier> = {
      ...(name && {
        name: {
          $ilike: `%${name}%`
        }
      })
    };

    const options: FindOptions<Modifier> = {
      offset: (filterOptions.page - 1) * filterOptions.limit,
      limit: filterOptions.limit,
      orderBy: {
        name: QueryOrder.ASC
      }
    };

    return modifierRepository.findAndCount(where, options);
  };
};
