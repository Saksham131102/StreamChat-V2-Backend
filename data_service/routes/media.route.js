import express from "express";
import {
  createMedia,
  getTrending,
  getFeatured,
  getMediaById,
  searchMedia,
} from "../controller/media.controller.js";

const router = express.Router();

// POST /media
router.post("/create-media", createMedia);

// GET /trending?type=movie|web_series|tv&limit=20
router.get("/trending", getTrending);

// GET /featured?limit=10
router.get("/featured", getFeatured);

// GET /search?q=Batman&type=movie&limit=20
router.get("/search", searchMedia);

// GET /media/:id
router.get("/:id", getMediaById);

export default router;
