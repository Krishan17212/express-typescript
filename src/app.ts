import express from "express";
import createHttpError from "http-errors";
import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";

const app = express();

// Routes

app.get("/", (req, res) => {
  const error = createHttpError(500, "Something went wrong");
  throw error;
  res.send("Hello World!");
});

// Global error handler

app.use(globalErrorMiddleware);

export default app;
