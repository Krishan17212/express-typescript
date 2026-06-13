import { type NextFunction, type Request, type Response } from "express";
import type { HttpError } from "http-errors";
import { config } from "../config/config.js";

const globalErrorMiddleware = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorStack: config.nodeEnv === "development" ? err.stack : "",
  });
};

export { globalErrorMiddleware };
