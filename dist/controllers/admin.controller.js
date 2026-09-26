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
exports.updateAppointmentStatus = exports.listAllAppointments = exports.getUserAppointments = exports.listUsers = exports.getStats = void 0;
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const Service_1 = require("../models/Service");
const Appointment_1 = require("../models/Appointment");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const appointmentService = __importStar(require("../services/appointment.service"));
const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled", "rejected"];
exports.getStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [totalUsers, totalServices, totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
        User_1.User.countDocuments({ role: "user" }),
        Service_1.Service.countDocuments(),
        Appointment_1.Appointment.countDocuments(),
        Appointment_1.Appointment.countDocuments({ status: "pending" }),
        Appointment_1.Appointment.countDocuments({ status: "completed" }),
    ]);
    res.status(200).json({
        success: true,
        data: { totalUsers, totalServices, totalAppointments, pendingAppointments, completedAppointments },
    });
});
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { search } = req.query;
    const filter = { role: "user" };
    if (search && typeof search === "string") {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const users = await User_1.User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
});
exports.getUserAppointments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid user id");
    const appointments = await Appointment_1.Appointment.find({ user: id }).populate("service").populate("timeSlot").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: appointments });
});
exports.listAllAppointments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, search, sort } = req.query;
    const filter = {};
    if (status && typeof status === "string" && VALID_STATUSES.includes(status)) {
        filter.status = status;
    }
    let query = Appointment_1.Appointment.find(filter).populate("service").populate("timeSlot").populate("user", "name email");
    query = sort === "oldest" ? query.sort({ createdAt: 1 }) : query.sort({ createdAt: -1 });
    let appointments = await query;
    // Simple in-memory search across populated user name/email/service name -
    // acceptable at this project's scale; a text index would be the next step
    // if the appointments collection grew large.
    if (search && typeof search === "string") {
        const term = search.toLowerCase();
        appointments = appointments.filter((appt) => {
            const user = appt.user;
            const service = appt.service;
            return (user?.name?.toLowerCase().includes(term) ||
                user?.email?.toLowerCase().includes(term) ||
                service?.name?.toLowerCase().includes(term));
        });
    }
    res.status(200).json({ success: true, data: appointments });
});
exports.updateAppointmentStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid appointment id");
    if (!VALID_STATUSES.includes(status))
        throw ApiError_1.ApiError.badRequest("Invalid status value");
    const appointment = await appointmentService.setAppointmentStatus(id, status);
    res.status(200).json({ success: true, data: appointment, message: "Appointment status updated" });
});
