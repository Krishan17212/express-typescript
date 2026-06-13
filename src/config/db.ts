import mongoose from "mongoose";
import { config } from "./config.js";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error", error);
    });
    await mongoose.connect(config.db.mongo_uri!);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDb;
