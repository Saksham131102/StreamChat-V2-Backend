import prisma from "../lib/prisma.js";

export const healthCheck = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      service: "auth_service",
      database: "CONNECTED",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "auth_service",
      message: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
};
