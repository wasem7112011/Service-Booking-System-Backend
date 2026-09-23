import { Types } from "mongoose";
import { Appointment } from "../models/Appointment";
import { Service } from "../models/Service";
import { TimeSlot } from "../models/TimeSlot";
import { ApiError } from "../utils/ApiError";
import { AppointmentStatus } from "../types/models";

function isPastSlot(date: string, startTime: string): boolean {
  // Slot's date/time are business-local wall-clock values (see date-handling
  // notes in the README). Comparing against "now" formatted the same way
  // avoids UTC/local offset bugs from parsing "date + time" as a Date object.
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowTimeStr = now.toISOString().slice(11, 16);
  if (date < todayStr) return true;
  if (date === todayStr && startTime <= nowTimeStr) return true;
  return false;
}

interface CreateAppointmentArgs {
  userId: string;
  serviceId: string;
  timeSlotId: string;
  notes?: string;
}

export async function createAppointment(args: CreateAppointmentArgs) {
  const { userId, serviceId, timeSlotId, notes } = args;

  if (!Types.ObjectId.isValid(serviceId) || !Types.ObjectId.isValid(timeSlotId)) {
    throw ApiError.badRequest("Invalid service or time slot id");
  }

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw ApiError.notFound("Service is unavailable");
  }

  const slot = await TimeSlot.findById(timeSlotId);
  if (!slot) {
    throw ApiError.notFound("Time slot not found");
  }
  if (isPastSlot(slot.date, slot.startTime)) {
    throw ApiError.badRequest("Cannot book a time slot in the past");
  }
  if (slot.isBooked) {
    throw ApiError.conflict("This time slot has already been booked");
  }

  // --- Concurrency handling -------------------------------------------------
  // Two users can both load this page and both see the slot as free; the
  // isBooked check above is only a fast, user-friendly pre-check and is NOT
  // sufficient on its own, because two requests can pass it at the same
  // instant (frontend validation is even less trustworthy - it can be
  // bypassed entirely). Real safety comes from the database:
  //
  // 1. Appointment has a partial unique index on `timeSlot` for active
  //    statuses, so MongoDB itself rejects a second active appointment
  //    for the same slot with an E11000 error, atomically.
  // 2. We additionally flip TimeSlot.isBooked with an atomic
  //    findOneAndUpdate filtered on isBooked: false, so the flag can only
  //    be set by whichever request wins the race.
  //
  // If either step loses the race, we roll back and return 409 Conflict.
  const slotClaim = await TimeSlot.findOneAndUpdate(
    { _id: timeSlotId, isBooked: false },
    { $set: { isBooked: true } },
    { new: true }
  );
  if (!slotClaim) {
    throw ApiError.conflict("This time slot has already been booked");
  }

  try {
    const appointment = await Appointment.create({
      user: userId,
      service: serviceId,
      timeSlot: timeSlotId,
      notes,
      status: "pending",
    });
    return appointment.populate(["service", "timeSlot"]);
  } catch (error) {
    // Roll back the slot claim if appointment creation failed for any reason
    // (including losing the unique-index race despite winning the flag flip).
    await TimeSlot.findByIdAndUpdate(timeSlotId, { $set: { isBooked: false } });
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 11000) {
      throw ApiError.conflict("This time slot has already been booked");
    }
    throw error;
  }
}

export async function cancelAppointment(appointmentId: string, userId: string, isAdmin: boolean) {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  if (!isAdmin && appointment.user.toString() !== userId) {
    throw ApiError.forbidden("You cannot cancel another user's appointment");
  }
  if (["completed", "cancelled", "rejected"].includes(appointment.status)) {
    throw ApiError.badRequest(`Cannot cancel an appointment that is already ${appointment.status}`);
  }

  appointment.status = "cancelled";
  await appointment.save();
  await TimeSlot.findByIdAndUpdate(appointment.timeSlot, { $set: { isBooked: false } });
  return appointment;
}

export async function setAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw ApiError.notFound("Appointment not found");

  appointment.status = status;
  await appointment.save();

  // Free the slot back up if the admin rejects or cancels it
  if (status === "cancelled" || status === "rejected") {
    await TimeSlot.findByIdAndUpdate(appointment.timeSlot, { $set: { isBooked: false } });
  }
  return appointment;
}
