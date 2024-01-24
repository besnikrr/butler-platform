import { BaseError, StatusCodes } from "./base-error";
declare class HttpError extends BaseError {
    constructor(name?: string, status?: StatusCodes, message?: string, errors?: string[]);
}
export { HttpError };
