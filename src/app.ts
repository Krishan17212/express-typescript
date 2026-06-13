import express from "express";
import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware.js";
import userRouter from "./router/userRouter.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRouter);

// Global error handler

app.use(globalErrorMiddleware);

export default app;
