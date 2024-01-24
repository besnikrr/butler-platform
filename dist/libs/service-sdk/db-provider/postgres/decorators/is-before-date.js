"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsBeforeDateConstraint = exports.IsBeforeDate = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
function IsBeforeDate(property, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBeforeDateConstraint
        });
    };
}
exports.IsBeforeDate = IsBeforeDate;
let IsBeforeDateConstraint = class IsBeforeDateConstraint {
    validate(value, args) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        return relatedValue ? value < relatedValue : true;
    }
    defaultMessage(args) {
        return `${args.property} must be before ${args.constraints[0]}`;
    }
};
IsBeforeDateConstraint = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ name: "IsBeforeDateConstraint" })
], IsBeforeDateConstraint);
exports.IsBeforeDateConstraint = IsBeforeDateConstraint;
//# sourceMappingURL=is-before-date.js.map