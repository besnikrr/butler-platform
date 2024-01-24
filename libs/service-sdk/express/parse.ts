
import { BadRequestError } from "../utils";

export const parsePaginationParam = (reqQuery: { [key: string]: any }) => {
  if (reqQuery?.page && reqQuery.page < 1) {
    throw new BadRequestError("Page should not be less than 1");
  }
  if (reqQuery?.limit && reqQuery.limit < 0) {
    throw new BadRequestError("Limit should not be less than 0");
  }

  return {
    page: reqQuery?.page ? Number(reqQuery.page) : 1,
    limit: reqQuery?.limit ? Number(reqQuery.limit) : 10,
    paginate: reqQuery?.paginate ?? true
  };
};
