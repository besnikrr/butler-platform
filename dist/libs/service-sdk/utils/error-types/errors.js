"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.CustomError = exports.ValidationError = exports.NotFoundError = exports.AuthorizationError = exports.BadRequestError = exports.ConflictError = void 0;
const _1 = require(".");
class ConflictError extends _1.BaseError {
    constructor(message) {
        super("Conflict Error", _1.StatusCodes.CONFLICT, message);
        this.message = message;
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends _1.BaseError {
    constructor(message) {
        super("Bad Request", _1.StatusCodes.BAD_REQUEST, message);
        this.message = message;
    }
}
exports.BadRequestError = BadRequestError;
class AuthorizationError extends _1.BaseError {
    constructor(message = "Permission denied") {
        super("Authorization Error", _1.StatusCodes.UNAUTHORIZED, message);
        this.message = message;
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends _1.BaseError {
    constructor(entityName, customMessage) {
        super("Not Found", _1.StatusCodes.NOT_FOUND, customMessage || entityName + " not found.");
        this.entityName = entityName;
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends _1.BaseError {
    constructor(message = "Internal server error.") {
        super("Internal Error", _1.StatusCodes.INTERNAL_SERVER, message);
    }
}
exports.InternalServerError = InternalServerError;
class ValidationError extends _1.BaseError {
    constructor(errors) {
        super("Validation Error", _1.StatusCodes.UNPROCESSABLE_ENTITY, "Validation error.", errors);
    }
}
exports.ValidationError = ValidationError;
class CustomError extends _1.BaseError {
    constructor(name, status, message) {
        super(name, status, message);
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=errors.js.map