declare enum StatusCodes {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    GONE = 410,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER = 500,
    NOT_IMPLEMENTED = 501
}
declare abstract class BaseError extends Error {
    readonly name: string;
    readonly status: StatusCodes;
    readonly message: string;
    readonly errors?: string[];
    constructor(name: string, status: StatusCodes, message: string, errors?: string[]);
    toJSON(): {
        stack: string;
        errors: string[];
        message: string;
        name: string;
        status: StatusCodes;
    };
}
export { StatusCodes, BaseError };
