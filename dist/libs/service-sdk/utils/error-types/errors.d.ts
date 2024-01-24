import { BaseError, StatusCodes } from ".";
declare class ConflictError extends BaseError {
    readonly message: string;
    constructor(message: string);
}
declare class BadRequestError extends BaseError {
    readonly message: string;
    constructor(message: string);
}
declare class AuthorizationError extends BaseError {
    readonly message: string;
    constructor(message?: string);
}
declare class NotFoundError extends BaseError {
    readonly entityName: string;
    constructor(entityName: string, customMessage?: string);
}
declare class InternalServerError extends BaseError {
    constructor(message?: string);
}
declare class ValidationError extends BaseError {
    constructor(errors: string[]);
}
declare class CustomError extends BaseError {
    constructor(name: string, status: StatusCodes, message: string);
}
export { ConflictError, BadRequestError, AuthorizationError, NotFoundError, ValidationError, CustomError, InternalServerError };
