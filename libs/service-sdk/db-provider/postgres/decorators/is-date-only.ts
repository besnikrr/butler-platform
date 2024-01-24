import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";

@ValidatorConstraint({ name: "IsDateOnly", async: false })
export class IsDateOnly implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const isDateOnlyRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;
    return isDateOnlyRegex.test(value);
  }
}
