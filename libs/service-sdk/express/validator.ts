
import { ValidationError } from "@butlerhospitality/service-sdk";
import { plainToInstance } from "class-transformer";
import { NextFunction, Response } from "express";
import { ActionRequest } from "../authorizer";
import { validateInput } from "../utils/validator";

export const validateRequest = (validationClass: any) => {
  return async (req: ActionRequest, res: Response, next: NextFunction) => {
    try {
      await validate(validationClass, req.body);
      req.isValid = true;
    } catch (e) {
      next(e);
    }
    next();
  };
};

export const validate = async (validationClass: any, payload: any, exec = true) => {
  if (!exec) {
    return;
  }
  const output = plainToInstance(validationClass, payload);
  const errors = await validateInput(output);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
};

export const lazyValidateRequest = async (validationClass: any, data: any) => {
  const output = plainToInstance(validationClass, data);
  const errors = await validateInput(output);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
};
