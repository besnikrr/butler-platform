import {
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidationArguments,
  ValidatorConstraintInterface
} from "class-validator";

/* This decorator is used to validate if the value is not a sibling of the given property
  i.g when we use this decorator on a specific field:
    @IsNotSiblingOf(["createdDate"])
    confirmationDate: string;
  this means that you can not have both confirmationDate and createdDate defined on the same object
*/
@ValidatorConstraint({ async: false })
class IsNotSiblingOfConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (value) {
      return this.getFailedConstraints(args).length === 0;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} cannot exist alongside the following defined properties: ${this.getFailedConstraints(args).join(", ")}`;
  }

  getFailedConstraints(args: ValidationArguments) {
    return args.constraints.filter((prop) => !!args.object[prop]);
  }
}

export function IsNotSiblingOf(props: string[], validationOptions?: ValidationOptions) {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: props,
      validator: IsNotSiblingOfConstraint
    });
  };
}
