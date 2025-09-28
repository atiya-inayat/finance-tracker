import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMe,
  forgotPassword,
  resetPassword,
  completeOnboarding,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/complete-onboarding", authMiddleware, completeOnboarding);

// add authMiddleware to protected routes
router.get("/me", authMiddleware, getMe);

export default router;
