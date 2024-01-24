"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsTime = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
let IsTime = class IsTime {
    validate(text, args) {
        const isTimeRegex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
        return isTimeRegex.test(text);
    }
};
IsTime = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsTime", async: false })
], IsTime);
exports.IsTime = IsTime;
//# sourceMappingURL=is-time.js.map