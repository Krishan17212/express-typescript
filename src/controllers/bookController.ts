import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import path from "node:path";
import fs from "node:fs";
import cloudinary from "../config/cloudinary.js";
import BookModel from "../models/bookModel.js";
import type { AuthRequest } from "../middleware/authenticate.js";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  const coverImageFile = files?.coverImage?.[0];
  const bookFile = files?.file?.[0];

  try {
    const { title, genre } = req.body;
    const author = (req as AuthRequest).userId;

    // Handle case where fields are sent multiple times (as arrays)
    const finalTitle = Array.isArray(title) ? title[0] : title;
    const finalGenre = Array.isArray(genre) ? genre[0] : genre;

    if (!finalTitle || typeof finalTitle !== "string" || !finalGenre || typeof finalGenre !== "string") {
      const error = createHttpError(
        400,
        "Title and genre are required and must be valid strings",
      );
      return next(error);
    }

    if (!coverImageFile) {
      const error = createHttpError(400, "Cover image is required");
      return next(error);
    }

    if (!bookFile) {
      const error = createHttpError(400, "Book file is required");
      return next(error);
    }

    // 1. Upload Cover Image
    const coverImageExt = path.extname(coverImageFile.originalname).slice(1);
    const coverImageOptions: any = {
      filename_override: coverImageFile.filename,
      folder: "book-covers",
      asset_folder: "book-covers",
    };
    if (coverImageExt) {
      coverImageOptions.format = coverImageExt;
    }

    const coverImageUploadResult = await cloudinary.uploader.upload(
      coverImageFile.path,
      coverImageOptions,
    );

    // 2. Upload Book File
    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFile.path,
      {
        filename_override: bookFile.filename,
        folder: "book-pdfs",
        asset_folder: "book-pdfs",
        resource_type: "raw", // PDF/EPUB and other docs should be uploaded as raw/auto
      },
    );

    // 3. Create Book in Database
    const newBook = await BookModel.create({
      title: finalTitle,
      genre: finalGenre,
      author: author as any,
      coverImage: coverImageUploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // 4. Clean up local files
    await fs.promises.unlink(coverImageFile.path).catch(() => {});
    await fs.promises.unlink(bookFile.path).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (error: any) {
    // Clean up local files on error
    if (coverImageFile) {
      await fs.promises.unlink(coverImageFile.path).catch(() => {});
    }
    if (bookFile) {
      await fs.promises.unlink(bookFile.path).catch(() => {});
    }
    next(createHttpError(500, error?.message));
  }
};

export { createBook };
