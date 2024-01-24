import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from "class-validator";
export declare function IsBeforeDate(property: string, validationOptions?: ValidationOptions): (object: any, propertyName: string) => void;
export declare class IsBeforeDateConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
