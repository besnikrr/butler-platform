import { BaseError, StatusCodes } from ".";

class ConflictError extends BaseError {
  readonly message: string;

  constructor(message: string) {
    super("Conflict Error", StatusCodes.CONFLICT, message);

    this.message = message;
  }
}

class BadRequestError extends BaseError {
  readonly message: string;

  constructor(message: string) {
    super("Bad Request", StatusCodes.BAD_REQUEST, message);

    this.message = message;
  }
}

class AuthorizationError extends BaseError {
  readonly message: string;

  constructor(message: string = "Permission denied") {
    super("Authorization Error", StatusCodes.UNAUTHORIZED, message);

    this.message = message;
  }
}

class NotFoundError extends BaseError {
  readonly entityName: string;

  constructor(entityName: string, customMessage?: string) {
    super("Not Found", StatusCodes.NOT_FOUND, customMessage || entityName + " not found.");

    this.entityName = entityName;
  }
}

class InternalServerError extends BaseError {
  constructor(message = "Internal server error.") {
    super("Internal Error", StatusCodes.INTERNAL_SERVER, message);
  }
}

class ValidationError extends BaseError {
  constructor(errors: string[]) {
    super("Validation Error", StatusCodes.UNPROCESSABLE_ENTITY, "Validation error.", errors);
  }
}

class CustomError extends BaseError {
  constructor(name: string, status: StatusCodes, message: string) {
    super(name, status, message);
  }
}

/*
    Add other error classes here if necessary...
*/

export { ConflictError, BadRequestError, AuthorizationError, NotFoundError, ValidationError, CustomError, InternalServerError };
