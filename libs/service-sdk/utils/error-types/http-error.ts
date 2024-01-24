import { BaseError, StatusCodes } from "./base-error";

class HttpError extends BaseError {
  constructor(name: string = "Internal Error", status: StatusCodes = StatusCodes.INTERNAL_SERVER, message: string = "Internal server error.", errors?: string[]) {
    super(name, status, message, errors);
  }
}

export { HttpError };
