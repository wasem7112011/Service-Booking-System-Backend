import { Response } from "express";
import { Types } from "mongoose";
import { Appointment } from "../models/Appointment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "../types/api";
import * as appointmentService from "../services/appointment.service";

export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { serviceId, timeSlotId, notes } = req.body;
  const appointment = await appointmentService.createAppointment({
    userId: req.user!.userId,
    serviceId,
    timeSlotId,
    notes,
  });
  res.status(201).json({ success: true, data: appointment, message: "Appointment booked successfully" });
});

export const getMyAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointments = await Appointment.find({ user: req.user!.userId })
    .populate("service")
    .populate("timeSlot")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: appointments });
});

export const getAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid appointment id");

  const appointment = await Appointment.findById(id).populate("service").populate("timeSlot");
  if (!appointment) throw ApiError.notFound("Appointment not found");

  const isOwner = appointment.user.toString() === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) throw ApiError.forbidden("You cannot view this appointment");

  res.status(200).json({ success: true, data: appointment });
});

export const cancelMyAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid appointment id");

  const appointment = await appointmentService.cancelAppointment(id, req.user!.userId, req.user!.role === "admin");
  res.status(200).json({ success: true, data: appointment, message: "Appointment cancelled" });
});
