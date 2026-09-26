"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
// Authentication: confirms WHO is making the request, by verifying the
// signed JWT sent in the Authorization header. Attaches the decoded
// payload to req.user for downstream handlers/middleware to use.
function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(ApiError_1.ApiError.unauthorized("Missing or invalid authorization header"));
    }
    const token = header.split(" ")[1];
    try {
        req.user = (0, jwt_1.verifyToken)(token);
        next();
    }
    catch {
        next(ApiError_1.ApiError.unauthorized("Invalid or expired token"));
    }
}
// Authorization: confirms WHAT the authenticated user is allowed to do.
// Always runs after requireAuth, and always re-checked on the backend -
// the frontend hiding an admin link is a UX nicety, not a security boundary.
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user)
            return next(ApiError_1.ApiError.unauthorized());
        if (!roles.includes(req.user.role)) {
            return next(ApiError_1.ApiError.forbidden("You do not have permission to perform this action"));
        }
        next();
    };
}
