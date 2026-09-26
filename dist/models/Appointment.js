"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const mongoose_1 = require("mongoose");
const appointmentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose_1.Schema.Types.ObjectId, ref: "Service", required: true },
    timeSlot: { type: mongoose_1.Schema.Types.ObjectId, ref: "TimeSlot", required: true },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
        default: "pending",
    },
    notes: { type: String, maxlength: 500 },
}, { timestamps: true });
// Last line of defense against double booking: a slot can have at most
// one appointment whose status is NOT cancelled/rejected. Two requests
// racing to book the same slot will both attempt to insert a document
// with the same timeSlot value; the second insert is rejected by MongoDB
// itself (E11000 duplicate key), even under concurrent requests, because
// the uniqueness check happens inside the database, not in application code.
appointmentSchema.index({ timeSlot: 1 }, {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed", "completed"] } },
});
appointmentSchema.index({ user: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });
exports.Appointment = (0, mongoose_1.model)("Appointment", appointmentSchema);
