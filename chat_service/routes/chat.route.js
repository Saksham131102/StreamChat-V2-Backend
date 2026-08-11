import express from "express";
import healthRoute from "./health.route.js";
import { fetchAllMessagesController } from "../controller/chat.controller.js";

const router = express.Router();

router.use("/healthz", healthRoute);

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "chat_service is live"
  });
});

router.get("/:roomId", fetchAllMessagesController);

export default router;