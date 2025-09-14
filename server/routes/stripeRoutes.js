import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
} from "../controllers/stripeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST request to create a checkout session
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

router.post(
  "/webhook",
  express.raw({
    type: "application/json", // required for Stripe
  }),
  handleWebhook
);

export default router;
