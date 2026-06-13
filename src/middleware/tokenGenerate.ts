import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import type { Response } from "express";

const generateToken = (id: string, res: Response) => {
  const token = jwt.sign({ id }, config.jwtSecret, { expiresIn: "7d" });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
