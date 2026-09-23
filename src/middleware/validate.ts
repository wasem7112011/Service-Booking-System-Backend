import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function validateRegister(req: Request, _res: Response, next: NextFunction): void {
  const { name, email, password, confirmPassword } = req.body;
  const errors: Record<string, string> = {};

  if (!name || typeof name !== "string" || name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) errors.email = "Valid email is required";
  if (!password || typeof password !== "string" || password.length < 8) errors.password = "Password must be at least 8 characters";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";

  if (Object.keys(errors).length > 0) return next(ApiError.badRequest("Invalid registration data", errors));
  next();
}

export function validateLogin(req: Request, _res: Response, next: NextFunction): void {
  const { email, password } = req.body;
  const errors: Record<string, string> = {};
  if (!email || !EMAIL_RE.test(email)) errors.email = "Valid email is required";
  if (!password) errors.password = "Password is required";
  if (Object.keys(errors).length > 0) return next(ApiError.badRequest("Invalid login data", errors));
  next();
}

export function validateService(req: Request, _res: Response, next: NextFunction): void {
  const { name, description, price, durationMinutes } = req.body;
  const errors: Record<string, string> = {};
  if (!name || typeof name !== "string" || name.trim().length < 2) errors.name = "Name is required";
  if (!description || typeof description !== "string") errors.description = "Description is required";
  if (typeof price !== "number" || price < 0) errors.price = "Price must be a non-negative number";
  if (typeof durationMinutes !== "number" || durationMinutes < 5) errors.durationMinutes = "Duration must be at least 5 minutes";
  if (Object.keys(errors).length > 0) return next(ApiError.badRequest("Invalid service data", errors));
  next();
}

export function validateTimeSlot(req: Request, _res: Response, next: NextFunction): void {
  const { date, startTime, endTime } = req.body;
  const errors: Record<string, string> = {};
  if (!date || !DATE_RE.test(date)) errors.date = "Date must be in YYYY-MM-DD format";
  if (!startTime || !TIME_RE.test(startTime)) errors.startTime = "Start time must be in HH:mm format";
  if (!endTime || !TIME_RE.test(endTime)) errors.endTime = "End time must be in HH:mm format";
  if (startTime && endTime && startTime >= endTime) errors.endTime = "End time must be after start time";
  if (Object.keys(errors).length > 0) return next(ApiError.badRequest("Invalid time slot data", errors));
  next();
}

export function validateAppointment(req: Request, _res: Response, next: NextFunction): void {
  const { serviceId, timeSlotId } = req.body;
  const errors: Record<string, string> = {};
  if (!serviceId || typeof serviceId !== "string") errors.serviceId = "Service is required";
  if (!timeSlotId || typeof timeSlotId !== "string") errors.timeSlotId = "Time slot is required";
  if (Object.keys(errors).length > 0) return next(ApiError.badRequest("Invalid booking data", errors));
  next();
}
