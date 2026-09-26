"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const ApiError_1 = require("../utils/ApiError");
function notFoundHandler(req, res) {
    const body = { success: false, message: `Route not found: ${req.originalUrl}` };
    res.status(404).json(body);
}
function errorHandler(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    if (err instanceof ApiError_1.ApiError) {
        const body = { success: false, message: err.message, errors: err.errors };
        res.status(err.statusCode).json(body);
        return;
    }
    // Mongoose duplicate key error (e.g. slot race condition, duplicate email)
    if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
        const body = { success: false, message: "This resource already exists or was just taken." };
        res.status(409).json(body);
        return;
    }
    // Mongoose validation error
    if (err instanceof Error && err.name === "ValidationError") {
        const body = { success: false, message: "Validation failed", errors: { detail: err.message } };
        res.status(400).json(body);
        return;
    }
    console.error("[unhandled error]", err);
    const body = { success: false, message: "Something went wrong. Please try again." };
    res.status(500).json(body);
}
