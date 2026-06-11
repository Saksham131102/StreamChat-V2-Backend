import express from "express";
import healthRoute from "./health.route.js";
import { createRoom, getRoomById } from "../controller/room.controller.js";

const router = express.Router();

router.use("/healthz", healthRoute);

router.post("/create", createRoom);
router.post("/get", getRoomById);

export default router;