import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
): void {
  const body: Record<string, unknown> = { success: true };
  if (message) body.message = message;
  if (data !== undefined) body.data = data;
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void {
  const body: Record<string, unknown> = {
    success: false,
    message,
  };
  if (errors !== undefined) body.errors = errors;
  res.status(statusCode).json(body);
}

export { StatusCodes };
