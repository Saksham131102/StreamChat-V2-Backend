import mongoose from "mongoose";

const connectDB = async (retries = process.env.DB_RETRY_LIMIT || 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `MongoDB Connection failed. Retries left: ${retries - 1}`,
      error.message,
    );

    if (retries <= 1) {
      console.error("MongoDB connection failed permanently. Exiting...");
      process.exit(1);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, process.env.DB_RETRY_DELAY || 5000);
    });

    return connectDB(retries - 1);
  }
};

export default connectDB;
