// routes/currencyRoutes.js
import express from "express";
import { convertCurrency } from "../utils/currencyConverter.js";

const router = express.Router();

router.get("/convert", async (req, res) => {
  const { amount, from, to } = req.query;
  try {
    const converted = await convertCurrency(amount, from, to);
    res.json({ success: true, converted });
  } catch (error) {
    res.status(500).json({ success: false, message: "Conversion failed" });
  }
});

export default router;
