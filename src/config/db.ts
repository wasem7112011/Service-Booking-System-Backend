import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log(`[db] Connected to MongoDB Atlas (${mongoose.connection.name})`);
  } catch (error) {
    console.error("[db] Connection failed:", (error as Error).message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });
}
