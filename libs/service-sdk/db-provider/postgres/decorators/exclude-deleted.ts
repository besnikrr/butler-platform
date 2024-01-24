import { Filter } from "@mikro-orm/core";

export type ExcludeDeletedOptions = {
  enabled?: boolean;
  defaultIsDeleted?: boolean;
  field?: string;
};

const defaultOptions = { enabled: true, defaultIsDeleted: false, field: "deleted_at" };

export const ExcludeDeleted = (options: ExcludeDeletedOptions = {}): ClassDecorator => {
  const { enabled, defaultIsDeleted, field } = { ...defaultOptions, ...options };
  return Filter({
    name: "excludeDeleted",
    cond: ({ isDeleted = defaultIsDeleted }: { isDeleted?: boolean } = {}) =>
      isDeleted ? { [field]: { $ne: null } } : isDeleted === false ? { [field]: null } : {},
    args: false,
    default: enabled
  });
};
