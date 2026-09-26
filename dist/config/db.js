"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    try {
        mongoose_1.default.set("strictQuery", true);
        await mongoose_1.default.connect(env_1.env.mongoUri);
        console.log(`[db] Connected to MongoDB Atlas (${mongoose_1.default.connection.name})`);
    }
    catch (error) {
        console.error("[db] Connection failed:", error.message);
        process.exit(1);
    }
    mongoose_1.default.connection.on("disconnected", () => {
        console.warn("[db] MongoDB disconnected");
    });
}
