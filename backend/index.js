import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import ExpressError from "./utils/ExpressError.js";

dotenv.config();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//cors
const corsOptions = { origin: "https://insta-vibe-rose.vercel.app", credentials: true };
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Root
app.get("/", (req, res) => res.json({ success: true, message: "API Running" }));

// 404 handler
app.use((req, res, next) => next(new ExpressError(404, "Page Not Found")));

// Global Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || "Server Error" });
});

// Start server after DB connect
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server + MongoDB connected on PORT ${PORT}`));
  } catch (err) {
    console.error("Failed to connect DB:", err);
  }
};

startServer();
