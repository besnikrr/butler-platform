import { Request, Response, NextFunction } from "express";
import { BaseError, HttpError, ValidationError } from "@butlerhospitality/service-sdk";
import {
  DriverException as MikroORMException,
  ValidationError as MikroORMValidationError,
  OptimisticLockError,
  UniqueConstraintViolationException
} from "@mikro-orm/core";
import { ConflictError, InternalServerError } from ".";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  if (err instanceof ValidationError) {
    const errors = [];
    let error: HttpError;

    if (err.errors) {
      err.errors.forEach((element: any) => errors.push(element));
      const validationError = new ValidationError(errors);

      error = new HttpError(validationError.name, validationError.status, validationError.message, errors);
    }
    return res.status(error.status).json(error).end();
  } else if (err instanceof MikroORMException || err instanceof MikroORMValidationError) {
    let error: HttpError;

    switch (true) {
    case err instanceof UniqueConstraintViolationException:
      error = new ConflictError("This entity already exists.");
      break;
    case err instanceof OptimisticLockError:
      error = new ConflictError("Someone else has already changed this entity.");
      break;
    default:
      error = new InternalServerError();
      break;
    }

    error = new HttpError(error.name, error.status, error.message);

    return res.status(error.status).json(error).end();
  } else {
    let error: HttpError;
    if (err instanceof BaseError) {
      const message = err.message?.replace(/\n/g, "").trim();
      error = new HttpError(err.name, err.status, message);
    } else {
      error = new HttpError();
    }

    return res.status(error.status).json(error).end();
  }
};
