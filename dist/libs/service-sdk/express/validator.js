"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyValidateRequest = exports.validate = exports.validateRequest = void 0;
const tslib_1 = require("tslib");
const service_sdk_1 = require("@butlerhospitality/service-sdk");
const class_transformer_1 = require("class-transformer");
const validator_1 = require("../utils/validator");
const validateRequest = (validationClass) => {
    return (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            yield exports.validate(validationClass, req.body);
            req.isValid = true;
        }
        catch (e) {
            next(e);
        }
        next();
    });
};
exports.validateRequest = validateRequest;
const validate = (validationClass, payload, exec = true) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!exec) {
        return;
    }
    const output = class_transformer_1.plainToInstance(validationClass, payload);
    const errors = yield validator_1.validateInput(output);
    if (errors.length > 0) {
        throw new service_sdk_1.ValidationError(errors);
    }
});
exports.validate = validate;
const lazyValidateRequest = (validationClass, data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const output = class_transformer_1.plainToInstance(validationClass, data);
    const errors = yield validator_1.validateInput(output);
    if (errors.length > 0) {
        throw new service_sdk_1.ValidationError(errors);
    }
});
exports.lazyValidateRequest = lazyValidateRequest;
//# sourceMappingURL=validator.js.map