import express from "express";
import healthRoute from "./health.route.js";
import mediaRoute from "./media.route.js";
import episodeRoute from "./episode.route.js";

const router = express.Router();

router.get("/favicon.ico", (req, res) => res.status(204).end());
router.use("/healthz", healthRoute);
router.use("/", mediaRoute);
router.use("/episodes", episodeRoute);

export default router;