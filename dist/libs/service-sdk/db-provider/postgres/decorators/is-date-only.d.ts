import { ValidatorConstraintInterface, ValidationArguments } from "class-validator";
export declare class IsDateOnly implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments): boolean;
}
