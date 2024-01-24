"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = exports.prettyError = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const prettyError = (errors) => {
    let allErrors = [];
    errors.forEach((err) => {
        var _a;
        if (err.children && ((_a = err.children) === null || _a === void 0 ? void 0 : _a.length) !== 0) {
            allErrors = [...allErrors, { entity: err.property, errors: [...exports.prettyError(err.children)] }];
            return allErrors;
        }
        allErrors.push(Object.values(err.constraints)[0]);
        return allErrors;
    });
    return allErrors;
};
exports.prettyError = prettyError;
const validateInput = (payload) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return class_validator_1.validate(payload, { whitelist: true, forbidNonWhitelisted: true }).then((validationErrors) => {
        if (validationErrors.length > 0) {
            return exports.prettyError(validationErrors);
        }
        return [];
    });
});
exports.validateInput = validateInput;
//# sourceMappingURL=validator.js.map