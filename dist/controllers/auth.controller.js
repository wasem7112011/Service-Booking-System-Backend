"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const jwt_1 = require("../utils/jwt");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await User_1.User.findOne({ email: email.toLowerCase() });
    if (existing)
        throw ApiError_1.ApiError.conflict("An account with this email already exists");
    const user = await User_1.User.create({ name, email, password, role: "user" });
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    res.status(201).json({
        success: true,
        data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
        message: "Registration successful",
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user)
        throw ApiError_1.ApiError.unauthorized("Invalid email or password");
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        throw ApiError_1.ApiError.unauthorized("Invalid email or password");
    const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
    res.status(200).json({
        success: true,
        data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
        message: "Login successful",
    });
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.userId);
    if (!user)
        throw ApiError_1.ApiError.notFound("User not found");
    res.status(200).json({
        success: true,
        data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});
