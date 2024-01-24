import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";

export function IsBeforeDate(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeDateConstraint
    });
  };
}

@ValidatorConstraint({ name: "IsBeforeDateConstraint" })
export class IsBeforeDateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    return relatedValue ? value < relatedValue : true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be before ${args.constraints[0]}`;
  }
}
