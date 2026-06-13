import express from "express";
import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";
import userRouter from "./router/userRouter.js";
import bookRouter from "./router/bookRouter.js";
import cors from "cors";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

// Global error handler

app.use(globalErrorMiddleware);

export default app;
