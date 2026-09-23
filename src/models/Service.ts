import { Schema, model } from "mongoose";
import { IService } from "../types/models";

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ isActive: 1 });

export const Service = model<IService>("Service", serviceSchema);
