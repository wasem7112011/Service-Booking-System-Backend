import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiFailure } from "../types/api";

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiFailure = { success: false, message: `Route not found: ${req.originalUrl}` };
  res.status(404).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    const body: ApiFailure = { success: false, message: err.message, errors: err.errors };
    res.status(err.statusCode).json(body);
    return;
  }

  // Mongoose duplicate key error (e.g. slot race condition, duplicate email)
  if (typeof err === "object" && err !== null && "code" in err && (err as { code: number }).code === 11000) {
    const body: ApiFailure = { success: false, message: "This resource already exists or was just taken." };
    res.status(409).json(body);
    return;
  }

  // Mongoose validation error
  if (err instanceof Error && err.name === "ValidationError") {
    const body: ApiFailure = { success: false, message: "Validation failed", errors: { detail: err.message } };
    res.status(400).json(body);
    return;
  }

  console.error("[unhandled error]", err);
  const body: ApiFailure = { success: false, message: "Something went wrong. Please try again." };
  res.status(500).json(body);
}
