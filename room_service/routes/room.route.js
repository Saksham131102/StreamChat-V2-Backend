import express from "express";
import healthRoute from "./health.route.js";

const router = express.Router();

router.use("/healthz", healthRoute);

export default router;