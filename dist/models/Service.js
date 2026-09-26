"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = require("mongoose");
const serviceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
serviceSchema.index({ isActive: 1 });
exports.Service = (0, mongoose_1.model)("Service", serviceSchema);
