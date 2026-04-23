import express from "express";
import { createEpisode } from "../controller/episode.controller.js";

const router = express.Router();

// POST /episodes
router.post("/", createEpisode);

export default router;
