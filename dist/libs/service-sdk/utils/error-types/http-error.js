"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
const base_error_1 = require("./base-error");
class HttpError extends base_error_1.BaseError {
    constructor(name = "Internal Error", status = base_error_1.StatusCodes.INTERNAL_SERVER, message = "Internal server error.", errors) {
        super(name, status, message, errors);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=http-error.js.map