"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsNotSiblingOf = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
/* This decorator is used to validate if the value is not a sibling of the given property
  i.g when we use this decorator on a specific field:
    @IsNotSiblingOf(["createdDate"])
    confirmationDate: string;
  this means that you can not have both confirmationDate and createdDate defined on the same object
*/
let IsNotSiblingOfConstraint = class IsNotSiblingOfConstraint {
    validate(value, args) {
        if (value) {
            return this.getFailedConstraints(args).length === 0;
        }
        return true;
    }
    defaultMessage(args) {
        return `${args.property} cannot exist alongside the following defined properties: ${this.getFailedConstraints(args).join(", ")}`;
    }
    getFailedConstraints(args) {
        return args.constraints.filter((prop) => !!args.object[prop]);
    }
};
IsNotSiblingOfConstraint = tslib_1.__decorate([
    class_validator_1.ValidatorConstraint({ async: false })
], IsNotSiblingOfConstraint);
function IsNotSiblingOf(props, validationOptions) {
    return (object, propertyName) => {
        class_validator_1.registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: props,
            validator: IsNotSiblingOfConstraint
        });
    };
}
exports.IsNotSiblingOf = IsNotSiblingOf;
//# sourceMappingURL=is-not-sibling-of.js.map