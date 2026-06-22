import mongoose from "mongoose";

let isConnected = false;

export const connectMongoDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("chat_service MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error("chat_service MongoDB connection error:", error.message);
    throw error;
  }
};
