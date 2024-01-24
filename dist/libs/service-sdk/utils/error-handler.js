"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const service_sdk_1 = require("@butlerhospitality/service-sdk");
const core_1 = require("@mikro-orm/core");
const _1 = require(".");
const errorHandler = (err, req, res, next) => {
    var _a;
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    if (err instanceof service_sdk_1.ValidationError) {
        const errors = [];
        let error;
        if (err.errors) {
            err.errors.forEach((element) => errors.push(element));
            const validationError = new service_sdk_1.ValidationError(errors);
            error = new service_sdk_1.HttpError(validationError.name, validationError.status, validationError.message, errors);
        }
        return res.status(error.status).json(error).end();
    }
    else if (err instanceof core_1.DriverException || err instanceof core_1.ValidationError) {
        let error;
        switch (true) {
            case err instanceof core_1.UniqueConstraintViolationException:
                error = new _1.ConflictError("This entity already exists.");
                break;
            case err instanceof core_1.OptimisticLockError:
                error = new _1.ConflictError("Someone else has already changed this entity.");
                break;
            default:
                error = new _1.InternalServerError();
                break;
        }
        error = new service_sdk_1.HttpError(error.name, error.status, error.message);
        return res.status(error.status).json(error).end();
    }
    else {
        let error;
        if (err instanceof service_sdk_1.BaseError) {
            const message = (_a = err.message) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, "").trim();
            error = new service_sdk_1.HttpError(err.name, err.status, message);
        }
        else {
            error = new service_sdk_1.HttpError();
        }
        return res.status(error.status).json(error).end();
    }
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map