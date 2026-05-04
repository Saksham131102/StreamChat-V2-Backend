import prisma from "../lib/prisma.js";

const connectDB = async (retries = process.env.DB_RETRY_LIMIT || 5) => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error(
      `PostgreSQL Connection failed. Retries left: ${retries - 1}`,
      error.message,
    );

    if (retries <= 1) {
      console.error("PostgreSQL connection failed permanently. Exiting...");
      process.exit(1);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, process.env.DB_RETRY_DELAY || 5000);
    });

    return connectDB(retries - 1);
  }
};

export default connectDB;
