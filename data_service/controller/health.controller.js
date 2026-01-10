export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "data_service",
    timestamp: new Date().toISOString()
  });
};