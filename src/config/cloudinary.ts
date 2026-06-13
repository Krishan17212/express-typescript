import { v2 as cloudinary } from "cloudinary";
import { config } from "./config.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name as string,
  api_key: config.cloudinary.api_key as string,
  api_secret: config.cloudinary.api_secret as string,
});

export default cloudinary;
