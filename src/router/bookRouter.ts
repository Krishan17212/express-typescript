import express from "express";
import { createBook } from "../controllers/bookController.js";
import multer from "multer";
import path from "node:path";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Multer
const upload = multer({
  dest: path.resolve(import.meta.dirname, "../../public/data/uploads"),
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

// Create book
router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook,
);

export default router;
