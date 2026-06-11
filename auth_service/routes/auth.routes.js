import express from "express";
import healthRoute from "./health.route.js";
import userRoute from "./user.route.js"
import {
  login,
  logout,
  signup,
  validateToken,
  refreshToken,
} from "../controller/auth.controller.js";

const router = express.Router();

router.use("/healthz", healthRoute);
router.use("/users", userRoute);

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "auth_service is live",
  });
});

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/validate", validateToken);
export default router;
