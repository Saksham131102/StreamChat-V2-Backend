import mongoose from "mongoose";
export const healthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.status(200).json({
    status: "ok",
    service: "auth_service",
    database: dbState === 1 ? "CONNECTED" : "DISCONNECTED",
    timestamp: new Date().toISOString(),
  });
};
