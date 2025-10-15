import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { handleWebhook } from "./controllers/stripeController.js"; // import webhook controller
import "./utils/cronJobs.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// connect to MongoDB
connectDB();

// cors config
app.use(
  cors({
    origin: "http://localhost:3000", // frontend origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ⚠️ Webhook route must come BEFORE express.json()
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Normal JSON parser for all other routes
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api", dashboardRoute);
app.use("/api/stripe", stripeRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
