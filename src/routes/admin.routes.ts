import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateService, validateTimeSlot } from "../middleware/validate";
import { getStats, listUsers, getUserAppointments, listAllAppointments, updateAppointmentStatus } from "../controllers/admin.controller";
import { adminListServices, createService, updateService, deleteService } from "../controllers/service.controller";
import { adminListSlots, createSlot, updateSlot, deleteSlot } from "../controllers/slot.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/stats", getStats);

router.get("/users", listUsers);
router.get("/users/:id/appointments", getUserAppointments);

router.get("/services", adminListServices);
router.post("/services", validateService, createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/slots", adminListSlots);
router.post("/slots", validateTimeSlot, createSlot);
router.put("/slots/:id", updateSlot);
router.delete("/slots/:id", deleteSlot);

router.get("/appointments", listAllAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

export default router;
