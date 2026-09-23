import { Document, Types } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IService extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeSlot extends Document {
  _id: Types.ObjectId;
  date: string; // "YYYY-MM-DD" in a fixed business timezone, see docs/date-handling
  startTime: string; // "HH:mm" 24h
  endTime: string; // "HH:mm" 24h
  isBooked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected";

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  service: Types.ObjectId;
  timeSlot: Types.ObjectId;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
