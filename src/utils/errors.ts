import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: unknown;

  constructor(
    statusCode: number,
    message: string,
    errors?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(StatusCodes.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors?: unknown) {
    super(StatusCodes.CONFLICT, message, errors);
  }
}
