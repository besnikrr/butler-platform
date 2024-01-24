"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDateOnly = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
let IsDateOnly = class IsDateOnly {
    validate(value, args) {
        const isDateOnlyRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
        return isDateOnlyRegex.test(value);
    }
};
IsDateOnly = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsDateOnly", async: false })
], IsDateOnly);
exports.IsDateOnly = IsDateOnly;
//# sourceMappingURL=is-date-only.js.map