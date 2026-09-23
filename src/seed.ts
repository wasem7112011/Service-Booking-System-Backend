import { connectDB } from "./config/db";
import { User } from "./models/User";
import { Service } from "./models/Service";
import { TimeSlot } from "./models/TimeSlot";
import mongoose from "mongoose";

async function seed() {
  await connectDB();

  const adminEmail = "admin@example.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "System Admin",
      email: adminEmail,
      password: "ChangeMe123!", // hashed automatically by the pre-save hook
      role: "admin",
    });
    console.log(`[seed] Admin created: ${adminEmail} / ChangeMe123! (change this immediately)`);
  } else {
    console.log("[seed] Admin already exists, skipping");
  }

  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany([
      { name: "Haircut & Styling", description: "Professional haircut and styling session.", price: 35, durationMinutes: 45 },
      { name: "Deep Tissue Massage", description: "60-minute therapeutic deep tissue massage.", price: 80, durationMinutes: 60 },
      { name: "Dental Consultation", description: "General dental checkup and consultation.", price: 50, durationMinutes: 30 },
      { name: "Personal Training Session", description: "One-on-one personal training session.", price: 45, durationMinutes: 60 },
    ]);
    console.log("[seed] Sample services created");
  } else {
    console.log("[seed] Services already exist, skipping");
  }

  const slotCount = await TimeSlot.countDocuments();
  if (slotCount === 0) {
    const slots = [];
    const today = new Date();
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      const hours = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
      for (const start of hours) {
        const [h, m] = start.split(":").map(Number);
        const endH = m === 0 ? h + 1 : h;
        const end = `${String(endH).padStart(2, "0")}:${m === 0 ? "00" : "30"}`;
        slots.push({ date: dateStr, startTime: start, endTime: end });
      }
    }
    await TimeSlot.insertMany(slots);
    console.log(`[seed] ${slots.length} sample time slots created for the next 7 days`);
  } else {
    console.log("[seed] Time slots already exist, skipping");
  }

  await mongoose.disconnect();
  console.log("[seed] Done");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
