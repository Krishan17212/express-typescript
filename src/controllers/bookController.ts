import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import path from "node:path";
import fs from "node:fs";
import cloudinary from "../config/cloudinary.js";
import BookModel from "../models/bookModel.js";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  const coverImageFile = files?.coverImage?.[0];
  const bookFile = files?.file?.[0];

  try {
    const { title, genre } = req.body;
    const author = req.userId;

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

const getCloudinaryPublicId = (url: string, isRaw = false) => {
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return null;

  const pathParts = url.substring(uploadIndex + 8).split("/");
  const partsAfterVersion = pathParts.slice(1);
  const publicIdWithExt = partsAfterVersion.join("/");

  if (isRaw) {
    return publicIdWithExt;
  } else {
    const extIndex = publicIdWithExt.lastIndexOf(".");
    return extIndex === -1 ? publicIdWithExt : publicIdWithExt.substring(0, extIndex);
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { bookId } = req.params;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const coverImageFile = files?.coverImage?.[0];
  const bookFile = files?.file?.[0];

  try {
    // 1. Check if the book exists in the database
    const book = await BookModel.findById(bookId);
    if (!book) {
      const error = createHttpError(404, "Book not found");
      return next(error);
    }

    // 2. Check authorization (only the author can update their book)
    const userId = req.userId;
    if (book.author.toString() !== userId) {
      const error = createHttpError(403, "You are not authorized to update this book");
      return next(error);
    }

    const { title, genre } = req.body;
    const updateData: any = {};

    // 3. Handle optional title update
    if (title) {
      const finalTitle = Array.isArray(title) ? title[0] : title;
      if (typeof finalTitle === "string" && finalTitle.trim()) {
        updateData.title = finalTitle;
      }
    }

    // 4. Handle optional genre update
    if (genre) {
      const finalGenre = Array.isArray(genre) ? genre[0] : genre;
      if (typeof finalGenre === "string" && finalGenre.trim()) {
        updateData.genre = finalGenre;
      }
    }

    // 5. Handle optional coverImage update
    if (coverImageFile) {
      const coverImageExt = path.extname(coverImageFile.originalname).slice(1);
      const coverImageOptions: any = {
        filename_override: coverImageFile.filename,
        folder: "book-covers",
        asset_folder: "book-covers",
      };
      if (coverImageExt) {
        coverImageOptions.format = coverImageExt;
      }

      // Upload new cover image
      const coverImageUploadResult = await cloudinary.uploader.upload(
        coverImageFile.path,
        coverImageOptions
      );
      updateData.coverImage = coverImageUploadResult.secure_url;

      // Delete old cover image from Cloudinary
      if (book.coverImage) {
        const oldPublicId = getCloudinaryPublicId(book.coverImage, false);
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId).catch((err) => {
            console.error("Failed to delete old cover image:", err);
          });
        }
      }
    }

    // 6. Handle optional book file update
    if (bookFile) {
      // Upload new book file
      const bookFileUploadResult = await cloudinary.uploader.upload(bookFile.path, {
        filename_override: bookFile.filename,
        folder: "book-pdfs",
        asset_folder: "book-pdfs",
        resource_type: "raw",
      });
      updateData.file = bookFileUploadResult.secure_url;

      // Delete old book file from Cloudinary
      if (book.file) {
        const oldPublicId = getCloudinaryPublicId(book.file, true);
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId, { resource_type: "raw" }).catch((err) => {
            console.error("Failed to delete old book file:", err);
          });
        }
      }
    }

    // 7. Update the book in MongoDB
    const updatedBook = await BookModel.findByIdAndUpdate(
      bookId,
      updateData,
      { new: true } // Return the updated document
    );

    // 8. Clean up local files
    if (coverImageFile) {
      await fs.promises.unlink(coverImageFile.path).catch(() => {});
    }
    if (bookFile) {
      await fs.promises.unlink(bookFile.path).catch(() => {});
    }

    res.json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
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

export { createBook, updateBook };
