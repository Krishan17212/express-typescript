import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error: any) {
    next(createHttpError(500, error?.message));
  }
};

export { createBook };
