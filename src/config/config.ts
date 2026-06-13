import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET!,
  db: {
    mongo_uri: process.env.MONGO_URI!,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  },
};

export const config = Object.freeze(_config);
