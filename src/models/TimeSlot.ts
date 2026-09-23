import { Schema, model } from "mongoose";
import { ITimeSlot } from "../types/models";

const timeSlotSchema = new Schema<ITimeSlot>(
  {
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    startTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    endTime: { type: String, required: true, match: /^\d{2}:\d{2}$/ },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevents the admin from ever creating two identical slots, and lets
// availability queries for a given date use an index instead of a scan.
timeSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });
timeSlotSchema.index({ date: 1, isBooked: 1 });

export const TimeSlot = model<ITimeSlot>("TimeSlot", timeSlotSchema);
