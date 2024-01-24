export interface BaseFilter {
    page: number;
    limit: number;
    paginate?: boolean;
    search?: string;
}

export const getPaginationParams = (filter: BaseFilter): { [key: string]: any } => {
  return {
    offset: !filter.paginate ? (filter.page - 1) * filter.limit : null,
    limit: !filter.paginate ? filter.limit : null
  };
};
