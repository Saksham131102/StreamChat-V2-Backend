import express from "express";
import healthRoute from "./health.route.js";

const router = express.Router();

router.use("/healthz", healthRoute);

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "auth_service is live",
  });
});

export default router;
