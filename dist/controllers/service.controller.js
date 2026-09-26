"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.adminListServices = exports.getService = exports.listServices = void 0;
const mongoose_1 = require("mongoose");
const Service_1 = require("../models/Service");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.listServices = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const services = await Service_1.Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: services });
});
exports.getService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid service id");
    const service = await Service_1.Service.findById(id);
    if (!service || !service.isActive)
        throw ApiError_1.ApiError.notFound("Service not found");
    res.status(200).json({ success: true, data: service });
});
// --- Admin ---
exports.adminListServices = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const services = await Service_1.Service.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: services });
});
exports.createService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const service = await Service_1.Service.create(req.body);
    res.status(201).json({ success: true, data: service, message: "Service created" });
});
exports.updateService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid service id");
    const service = await Service_1.Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!service)
        throw ApiError_1.ApiError.notFound("Service not found");
    res.status(200).json({ success: true, data: service, message: "Service updated" });
});
exports.deleteService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.Types.ObjectId.isValid(id))
        throw ApiError_1.ApiError.badRequest("Invalid service id");
    const service = await Service_1.Service.findByIdAndDelete(id);
    if (!service)
        throw ApiError_1.ApiError.notFound("Service not found");
    res.status(200).json({ success: true, data: null, message: "Service deleted" });
});
