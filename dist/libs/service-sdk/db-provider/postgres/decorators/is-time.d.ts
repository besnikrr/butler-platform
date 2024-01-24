import { ValidatorConstraintInterface, ValidationArguments } from "class-validator";
export declare class IsTime implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments): boolean;
}
