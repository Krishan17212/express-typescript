import express from "express";
import { createBook } from "../controllers/bookController.js";
import multer from "multer";

const router = express.Router();

// Multer
const upload = multer({
  dest: "../../public/data/uploads",
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

// Create book
router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook,
);

export default router;
