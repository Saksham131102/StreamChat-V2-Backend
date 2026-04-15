import express from "express";
import healthRoute from "./health.route.js";
import mediaRoute from "./media.route.js";

const router = express.Router();

router.use("/healthz", healthRoute);
router.use("/", mediaRoute);

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "data_service is live"
  });
});

export default router;