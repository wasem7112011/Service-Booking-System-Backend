"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
exports.validateService = validateService;
exports.validateTimeSlot = validateTimeSlot;
exports.validateAppointment = validateAppointment;
const ApiError_1 = require("../utils/ApiError");
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
function validateRegister(req, _res, next) {
    const { name, email, password, confirmPassword } = req.body;
    const errors = {};
    if (!name || typeof name !== "string" || name.trim().length < 2)
        errors.name = "Name must be at least 2 characters";
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email))
        errors.email = "Valid email is required";
    if (!password || typeof password !== "string" || password.length < 8)
        errors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0)
        return next(ApiError_1.ApiError.badRequest("Invalid registration data", errors));
    next();
}
function validateLogin(req, _res, next) {
    const { email, password } = req.body;
    const errors = {};
    if (!email || !EMAIL_RE.test(email))
        errors.email = "Valid email is required";
    if (!password)
        errors.password = "Password is required";
    if (Object.keys(errors).length > 0)
        return next(ApiError_1.ApiError.badRequest("Invalid login data", errors));
    next();
}
function validateService(req, _res, next) {
    const { name, description, price, durationMinutes } = req.body;
    const errors = {};
    if (!name || typeof name !== "string" || name.trim().length < 2)
        errors.name = "Name is required";
    if (!description || typeof description !== "string")
        errors.description = "Description is required";
    if (typeof price !== "number" || price < 0)
        errors.price = "Price must be a non-negative number";
    if (typeof durationMinutes !== "number" || durationMinutes < 5)
        errors.durationMinutes = "Duration must be at least 5 minutes";
    if (Object.keys(errors).length > 0)
        return next(ApiError_1.ApiError.badRequest("Invalid service data", errors));
    next();
}
function validateTimeSlot(req, _res, next) {
    const { date, startTime, endTime } = req.body;
    const errors = {};
    if (!date || !DATE_RE.test(date))
        errors.date = "Date must be in YYYY-MM-DD format";
    if (!startTime || !TIME_RE.test(startTime))
        errors.startTime = "Start time must be in HH:mm format";
    if (!endTime || !TIME_RE.test(endTime))
        errors.endTime = "End time must be in HH:mm format";
    if (startTime && endTime && startTime >= endTime)
        errors.endTime = "End time must be after start time";
    if (Object.keys(errors).length > 0)
        return next(ApiError_1.ApiError.badRequest("Invalid time slot data", errors));
    next();
}
function validateAppointment(req, _res, next) {
    const { serviceId, timeSlotId } = req.body;
    const errors = {};
    if (!serviceId || typeof serviceId !== "string")
        errors.serviceId = "Service is required";
    if (!timeSlotId || typeof timeSlotId !== "string")
        errors.timeSlotId = "Time slot is required";
    if (Object.keys(errors).length > 0)
        return next(ApiError_1.ApiError.badRequest("Invalid booking data", errors));
    next();
}
