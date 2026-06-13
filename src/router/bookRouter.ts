import express from "express";
import { createBook } from "../controllers/bookController.js";

const router = express.Router();

// Create book
router.post("/", createBook);

export default router;
