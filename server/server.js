import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// connect to MongoDB
connectDB();

// routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
