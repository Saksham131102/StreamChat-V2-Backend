export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "chat_service",
    timestamp: new Date().toISOString()
  });
};