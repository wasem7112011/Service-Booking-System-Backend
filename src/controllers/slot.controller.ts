import { Response } from "express";
import { Types } from "mongoose";
import { TimeSlot } from "../models/TimeSlot";
import { Appointment } from "../models/Appointment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

// Public: available slots for a given date (defaults to not booked, future only)
export const getAvailableSlots = asyncHandler(async (req, res: Response) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") throw ApiError.badRequest("A date query parameter is required (YYYY-MM-DD)");

  const slots = await TimeSlot.find({ date, isBooked: false }).sort({ startTime: 1 });
  res.status(200).json({ success: true, data: slots });
});

// --- Admin ---

export const adminListSlots = asyncHandler(async (req, res: Response) => {
  const { date } = req.query;
  const filter = date && typeof date === "string" ? { date } : {};
  const slots = await TimeSlot.find(filter).sort({ date: 1, startTime: 1 });
  res.status(200).json({ success: true, data: slots });
});

export const createSlot = asyncHandler(async (req, res: Response) => {
  const slot = await TimeSlot.create(req.body);
  res.status(201).json({ success: true, data: slot, message: "Time slot created" });
});

export const updateSlot = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid slot id");

  const slot = await TimeSlot.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!slot) throw ApiError.notFound("Time slot not found");
  res.status(200).json({ success: true, data: slot, message: "Time slot updated" });
});

export const deleteSlot = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid slot id");

  const hasAppointment = await Appointment.exists({
    timeSlot: id,
    status: { $in: ["pending", "confirmed", "completed"] },
  });
  if (hasAppointment) throw ApiError.conflict("Cannot delete a slot with an active appointment");

  const slot = await TimeSlot.findByIdAndDelete(id);
  if (!slot) throw ApiError.notFound("Time slot not found");
  res.status(200).json({ success: true, data: null, message: "Time slot deleted" });
});
