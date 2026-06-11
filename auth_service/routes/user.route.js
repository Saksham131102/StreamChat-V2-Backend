import express from "express";
import { getUserById, getUserByIds } from "../controller/user.controller.js";

const router = express.Router();

router.get("/:id", getUserById);
// router.get("/", getUsers);
router.post("/batch", getUserByIds);

export default router;