import { Response } from "express";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Service } from "../models/Service";
import { Appointment } from "../models/Appointment";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as appointmentService from "../services/appointment.service";
import { AppointmentStatus } from "../types/models";

const VALID_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "rejected"];

export const getStats = asyncHandler(async (_req, res: Response) => {
  const [totalUsers, totalServices, totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Service.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "completed" }),
  ]);

  res.status(200).json({
    success: true,
    data: { totalUsers, totalServices, totalAppointments, pendingAppointments, completedAppointments },
  });
});

export const listUsers = asyncHandler(async (req, res: Response) => {
  const { search } = req.query;
  const filter: Record<string, unknown> = { role: "user" };
  if (search && typeof search === "string") {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

export const getUserAppointments = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid user id");

  const appointments = await Appointment.find({ user: id }).populate("service").populate("timeSlot").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: appointments });
});

export const listAllAppointments = asyncHandler(async (req, res: Response) => {
  const { status, search, sort } = req.query;
  const filter: Record<string, unknown> = {};
  if (status && typeof status === "string" && VALID_STATUSES.includes(status as AppointmentStatus)) {
    filter.status = status;
  }

  let query = Appointment.find(filter).populate("service").populate("timeSlot").populate("user", "name email");

  query = sort === "oldest" ? query.sort({ createdAt: 1 }) : query.sort({ createdAt: -1 });

  let appointments = await query;

  // Simple in-memory search across populated user name/email/service name -
  // acceptable at this project's scale; a text index would be the next step
  // if the appointments collection grew large.
  if (search && typeof search === "string") {
    const term = search.toLowerCase();
    appointments = appointments.filter((appt) => {
      const user = appt.user as unknown as { name?: string; email?: string };
      const service = appt.service as unknown as { name?: string };
      return (
        user?.name?.toLowerCase().includes(term) ||
        user?.email?.toLowerCase().includes(term) ||
        service?.name?.toLowerCase().includes(term)
      );
    });
  }

  res.status(200).json({ success: true, data: appointments });
});

export const updateAppointmentStatus = asyncHandler(async (req, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!Types.ObjectId.isValid(id)) throw ApiError.badRequest("Invalid appointment id");
  if (!VALID_STATUSES.includes(status)) throw ApiError.badRequest("Invalid status value");

  const appointment = await appointmentService.setAppointmentStatus(id, status);
  res.status(200).json({ success: true, data: appointment, message: "Appointment status updated" });
});
