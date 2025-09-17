import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import dashboardRoute from "./routes/dashboardRoute.js";
import stripeRoutes from "./routes/stripeRoutes.js";
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
    origin: "http://localhost:3001", // frontend origin
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
