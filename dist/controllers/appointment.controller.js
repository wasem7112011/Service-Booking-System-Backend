"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMyAppointment = exports.getAppointment = exports.getMyAppointments = exports.createAppointment = void 0;
const mongoose_1 = require("mongoose");
const Appointment_1 = require("../models/Appointment");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const appointmentService = __importStar(require("../services/appointment.service"));
exports.createAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { serviceId, timeSlotId, notes } = req.body;
    const appointment = await appointmentService.createAppointment({
        userId: req.user.userId,
        serviceId,
        timeSlotId,
        notes,
    });
    res.status(201).json({ success: true, data: appointment, message: "Appointment booked successfully" });
});
exports.getMyAppointments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const appointments = await Appointment_1.Appointment.find({ user: req.user.userId })
        .populate("service")
        .populate("timeSlot")
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: appointments });
});
exports.getAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid appointment id");
    const appointment = await Appointment_1.Appointment.findById(id).populate("service").populate("timeSlot");
    if (!appointment)
        throw ApiError_1.ApiError.notFound("Appointment not found");
    const isOwner = appointment.user.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
        throw ApiError_1.ApiError.forbidden("You cannot view this appointment");
    res.status(200).json({ success: true, data: appointment });
});
exports.cancelMyAppointment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid appointment id");
    const appointment = await appointmentService.cancelAppointment(id, req.user.userId, req.user.role === "admin");
    res.status(200).json({ success: true, data: appointment, message: "Appointment cancelled" });
});
