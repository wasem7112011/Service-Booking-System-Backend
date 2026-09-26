"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSlot = exports.updateSlot = exports.createSlot = exports.adminListSlots = exports.getAvailableSlots = void 0;
const mongoose_1 = require("mongoose");
const TimeSlot_1 = require("../models/TimeSlot");
const Appointment_1 = require("../models/Appointment");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
// Public: available slots for a given date (defaults to not booked, future only)
exports.getAvailableSlots = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date } = req.query;
    if (!date || typeof date !== "string")
        throw ApiError_1.ApiError.badRequest("A date query parameter is required (YYYY-MM-DD)");
    const slots = await TimeSlot_1.TimeSlot.find({ date, isBooked: false }).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: slots });
});
// --- Admin ---
exports.adminListSlots = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date } = req.query;
    const filter = date && typeof date === "string" ? { date } : {};
    const slots = await TimeSlot_1.TimeSlot.find(filter).sort({ date: 1, startTime: 1 });
    res.status(200).json({ success: true, data: slots });
});
exports.createSlot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const slot = await TimeSlot_1.TimeSlot.create(req.body);
    res.status(201).json({ success: true, data: slot, message: "Time slot created" });
});
exports.updateSlot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid slot id");
    const slot = await TimeSlot_1.TimeSlot.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!slot)
        throw ApiError_1.ApiError.notFound("Time slot not found");
    res.status(200).json({ success: true, data: slot, message: "Time slot updated" });
});
exports.deleteSlot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid slot id");
    const hasAppointment = await Appointment_1.Appointment.exists({
        timeSlot: id,
        status: { $in: ["pending", "confirmed", "completed"] },
    });
    if (hasAppointment)
        throw ApiError_1.ApiError.conflict("Cannot delete a slot with an active appointment");
    const slot = await TimeSlot_1.TimeSlot.findByIdAndDelete(id);
    if (!slot)
        throw ApiError_1.ApiError.notFound("Time slot not found");
    res.status(200).json({ success: true, data: null, message: "Time slot deleted" });
});
