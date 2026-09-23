import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { validateRegister, validateLogin } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, getMe);

export default router;
