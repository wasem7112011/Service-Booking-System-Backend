import { NextFunction, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types/api";
import { UserRole } from "../types/models";

// Authentication: confirms WHO is making the request, by verifying the
// signed JWT sent in the Authorization header. Attaches the decoded
// payload to req.user for downstream handlers/middleware to use.
export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or invalid authorization header"));
  }

  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

// Authorization: confirms WHAT the authenticated user is allowed to do.
// Always runs after requireAuth, and always re-checked on the backend -
// the frontend hiding an admin link is a UX nicety, not a security boundary.
export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
