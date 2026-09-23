import { Response } from "express";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../types/api";

export const register = asyncHandler(async (req, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await User.create({ name, email, password, role: "user" });
  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.status(201).json({
    success: true,
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    message: "Registration successful",
  });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.status(200).json({
    success: true,
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    message: "Login successful",
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw ApiError.notFound("User not found");
  res.status(200).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});
