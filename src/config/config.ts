import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET!,
  db: {
    mongo_uri: process.env.MONGO_URI,
  },
};

export const config = Object.freeze(_config);
