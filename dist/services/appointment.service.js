"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = createAppointment;
exports.cancelAppointment = cancelAppointment;
exports.setAppointmentStatus = setAppointmentStatus;
const mongoose_1 = require("mongoose");
const Appointment_1 = require("../models/Appointment");
const Service_1 = require("../models/Service");
const TimeSlot_1 = require("../models/TimeSlot");
const ApiError_1 = require("../utils/ApiError");
function isPastSlot(date, startTime) {
    // Slot's date/time are business-local wall-clock values (see date-handling
    // notes in the README). Comparing against "now" formatted the same way
    // avoids UTC/local offset bugs from parsing "date + time" as a Date object.
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nowTimeStr = now.toISOString().slice(11, 16);
    if (date < todayStr)
        return true;
    if (date === todayStr && startTime <= nowTimeStr)
        return true;
    return false;
}
async function createAppointment(args) {
    const { userId, serviceId, timeSlotId, notes } = args;
    if (!mongoose_1.Types.ObjectId.isValid(serviceId) || !mongoose_1.Types.ObjectId.isValid(timeSlotId)) {
        throw ApiError_1.ApiError.badRequest("Invalid service or time slot id");
    }
    const service = await Service_1.Service.findById(serviceId);
    if (!service || !service.isActive) {
        throw ApiError_1.ApiError.notFound("Service is unavailable");
    }
    const slot = await TimeSlot_1.TimeSlot.findById(timeSlotId);
    if (!slot) {
        throw ApiError_1.ApiError.notFound("Time slot not found");
    }
    if (isPastSlot(slot.date, slot.startTime)) {
        throw ApiError_1.ApiError.badRequest("Cannot book a time slot in the past");
    }
    if (slot.isBooked) {
        throw ApiError_1.ApiError.conflict("This time slot has already been booked");
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
    const slotClaim = await TimeSlot_1.TimeSlot.findOneAndUpdate({ _id: timeSlotId, isBooked: false }, { $set: { isBooked: true } }, { new: true });
    if (!slotClaim) {
        throw ApiError_1.ApiError.conflict("This time slot has already been booked");
    }
    try {
        const appointment = await Appointment_1.Appointment.create({
            user: userId,
            service: serviceId,
            timeSlot: timeSlotId,
            notes,
            status: "pending",
        });
        return appointment.populate(["service", "timeSlot"]);
    }
    catch (error) {
        // Roll back the slot claim if appointment creation failed for any reason
        // (including losing the unique-index race despite winning the flag flip).
        await TimeSlot_1.TimeSlot.findByIdAndUpdate(timeSlotId, { $set: { isBooked: false } });
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            throw ApiError_1.ApiError.conflict("This time slot has already been booked");
        }
        throw error;
    }
}
async function cancelAppointment(appointmentId, userId, isAdmin) {
    const appointment = await Appointment_1.Appointment.findById(appointmentId);
    if (!appointment)
        throw ApiError_1.ApiError.notFound("Appointment not found");
    if (!isAdmin && appointment.user.toString() !== userId) {
        throw ApiError_1.ApiError.forbidden("You cannot cancel another user's appointment");
    }
    if (["completed", "cancelled", "rejected"].includes(appointment.status)) {
        throw ApiError_1.ApiError.badRequest(`Cannot cancel an appointment that is already ${appointment.status}`);
    }
    appointment.status = "cancelled";
    await appointment.save();
    await TimeSlot_1.TimeSlot.findByIdAndUpdate(appointment.timeSlot, { $set: { isBooked: false } });
    return appointment;
}
async function setAppointmentStatus(appointmentId, status) {
    const appointment = await Appointment_1.Appointment.findById(appointmentId);
    if (!appointment)
        throw ApiError_1.ApiError.notFound("Appointment not found");
    appointment.status = status;
    await appointment.save();
    // Free the slot back up if the admin rejects or cancels it
    if (status === "cancelled" || status === "rejected") {
        await TimeSlot_1.TimeSlot.findByIdAndUpdate(appointment.timeSlot, { $set: { isBooked: false } });
    }
    return appointment;
}
