"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = exports.StatusCodes = void 0;
var StatusCodes;
(function (StatusCodes) {
    StatusCodes[StatusCodes["OK"] = 200] = "OK";
    StatusCodes[StatusCodes["CREATED"] = 201] = "CREATED";
    StatusCodes[StatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCodes[StatusCodes["UNAUTHORIZED"] = 403] = "UNAUTHORIZED";
    StatusCodes[StatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCodes[StatusCodes["CONFLICT"] = 409] = "CONFLICT";
    StatusCodes[StatusCodes["GONE"] = 410] = "GONE";
    StatusCodes[StatusCodes["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    StatusCodes[StatusCodes["INTERNAL_SERVER"] = 500] = "INTERNAL_SERVER";
    StatusCodes[StatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(StatusCodes || (StatusCodes = {}));
exports.StatusCodes = StatusCodes;
class BaseError extends Error {
    constructor(name, status, message, errors = []) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.message = message;
        this.status = status;
        this.errors = errors;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
    toJSON() {
        return Object.assign(Object.assign(Object.assign({ name: this.name, status: this.status }, (this.errors.length === 0 && { message: this.message })), (this.errors.length > 0 && { errors: this.errors })), ((process.env.STAGE === "local" || process.env.STAGE === "development") && { stack: this.stack }));
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=base-error.js.map