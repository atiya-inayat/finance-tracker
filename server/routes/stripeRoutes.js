import express from "express";
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  reactivateSubscription,
} from "../controllers/stripeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stripe billing endpoints
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.post("/create-portal-session", authMiddleware, createPortalSession);
router.post("/cancel", authMiddleware, cancelSubscription);
router.post("/reactivate", authMiddleware, reactivateSubscription);

export default router;
