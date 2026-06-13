import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { config } from "../config/config.js";
import userModel from "../models/userModel.js";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = "";

    // 1. Try to extract token from Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] ?? "";
    }

    // 2. Fallback to extracting from raw cookies header (avoiding cookie-parser dependency)
    if (!token && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map((c) => {
          const parts = c.trim().split("=");
          return [parts[0], parts.slice(1).join("=")];
        })
      );
      token = cookies["jwt"] || "";
    }

    if (!token) {
      const error = createHttpError(401, "Authorization token is required");
      return next(error);
    }

    // 3. Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    // 4. Verify user exists in database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }

    // 5. Attach userId to request object
    req.userId = decoded.id;
    next();
  } catch (error: any) {
    next(createHttpError(401, "Invalid or expired authorization token"));
  }
};

export default authenticate;
