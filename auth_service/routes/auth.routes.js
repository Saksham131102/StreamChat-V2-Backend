import express from "express";
import healthRoute from "./health.route.js";
import { login, logout, signup } from "../controller/auth.controller.js";

const router = express.Router();

router.use("/healthz", healthRoute);

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "auth_service is live",
  });
});

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
export default router;
