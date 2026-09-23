import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateAppointment } from "../middleware/validate";
import {
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelMyAppointment,
} from "../controllers/appointment.controller";

const router = Router();

router.use(requireAuth);

router.post("/", validateAppointment, createAppointment);
router.get("/my", getMyAppointments);
router.get("/:id", getAppointment);
router.delete("/:id", cancelMyAppointment);

export default router;
