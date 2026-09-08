import express from "express";
import healthRoute from "./health.route.js";
import { createRoom, getRoomById, joinRoom, closeRoom } from "../controller/room.controller.js";

const router = express.Router();

router.use("/healthz", healthRoute);

router.post("/create", createRoom);
router.post("/get", getRoomById);
router.post("/join", joinRoom);
router.post("/close", closeRoom);

export default router;