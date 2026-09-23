import { Request } from "express";
import { UserRole } from "./models";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface CreateTimeSlotInput {
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentInput {
  serviceId: string;
  timeSlotId: string;
  notes?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
}
