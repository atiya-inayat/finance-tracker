import mongoose, { mongo } from "mongoose";
import { configDotenv } from "dotenv";

// Load environment variables
configDotenv();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;
