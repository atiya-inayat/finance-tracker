import express from "express";
import connectDB from "./config/db.js";

const app = express();

// connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
