import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
  deleteAccount,
} from "../controllers/profileController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get logged-in user profile
router.get("/me", authMiddleware, getProfile);

// Update profile info
router.put("/update", authMiddleware, updateProfile);

// Change password
router.put("/password", authMiddleware, updatePassword);

// Update avatar (photo)
router.put("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);

// dlt account
router.delete("/delete", authMiddleware, deleteAccount);

export default router;
