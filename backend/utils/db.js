import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

const connectDB = async () => {
  try {
    if (!process.env.MONGODB) {
      throw new Error("MONGODB URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
