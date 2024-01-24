import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

@ValidatorConstraint({ name: "IsTime", async: false })
export class IsTime implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const isTimeRegex = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
    return isTimeRegex.test(text);
  }
}
