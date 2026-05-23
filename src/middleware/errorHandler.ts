import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/response";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.errors);
    return;
  }

  console.error("Unhandled error:", err.message);
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal server error"
  );
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, StatusCodes.NOT_FOUND, "Route not found");
}
