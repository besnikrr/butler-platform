
import { validate, ValidationError as ClassValidationError } from "class-validator";

export const prettyError = (errors: ClassValidationError[]) => {
  let allErrors = [];
  errors.forEach((err) => {
    if (err.children && err.children?.length !== 0) {
      allErrors = [...allErrors, { entity: err.property, errors: [...prettyError(err.children)] }];
      return allErrors;
    }
    allErrors.push(Object.values(err.constraints)[0]);
    return allErrors;
  });
  return allErrors;
};

export const validateInput = async (payload: any): Promise<string[]> => {
  return validate(payload, { whitelist: true, forbidNonWhitelisted: true }).then((validationErrors) => {
    if (validationErrors.length > 0) {
      return prettyError(validationErrors);
    }
    return [];
  });
};
