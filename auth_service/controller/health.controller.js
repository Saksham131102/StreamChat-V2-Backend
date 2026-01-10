export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "auth_service",
    timestamp: new Date().toISOString()
  });
};