"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slot_controller_1 = require("../controllers/slot.controller");
const router = (0, express_1.Router)();
router.get("/available", slot_controller_1.getAvailableSlots);
exports.default = router;
