import { Response } from "express";
import { Types } from "mongoose";
import { Service } from "../models/Service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listServices = asyncHandler(async (_req, res: Response) => {
  const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: services });
});

export const getService = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid service id");

  const service = await Service.findById(id);
  if (!service || !service.isActive) throw ApiError.notFound("Service not found");
  res.status(200).json({ success: true, data: service });
});

// --- Admin ---

export const adminListServices = asyncHandler(async (_req, res: Response) => {
  const services = await Service.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: services });
});

export const createService = asyncHandler(async (req, res: Response) => {
  const service = await Service.create(req.body);
  res.status(201).json({ success: true, data: service, message: "Service created" });
});

export const updateService = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid service id");

  const service = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!service) throw ApiError.notFound("Service not found");
  res.status(200).json({ success: true, data: service, message: "Service updated" });
});

export const deleteService = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid service id");

  const service = await Service.findByIdAndDelete(id);
  if (!service) throw ApiError.notFound("Service not found");
  res.status(200).json({ success: true, data: null, message: "Service deleted" });
});
