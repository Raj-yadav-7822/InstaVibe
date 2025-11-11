import express from "express";
import cors from "cors";
const { urlencoded } = express;
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

if (process.env.NODE_ENV !== "production") {
  console.log(`Server running on port ${PORT}`);
}


app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I am get",
    success: true,
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND,
  credentials: true,
};
app.use(cors(corsOptions));

// APIs
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);




//  Handle all unknown routes
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//  Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
    },
  });
});

// Server
server.listen(PORT, () => {
  connectDB();
  console.log(` Server + MongoDB connected on PORT ${PORT}`);
});
