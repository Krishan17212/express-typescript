import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import generateToken from "../middleware/tokenGenerate.js";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }

    const userExists = await userModel.findOne({ email });

    if (userExists) {
      const error = createHttpError(400, "User already exists");
      return next(error);
    }

    // Password has
    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPass,
    });

    // Generate Token
    const token = generateToken(newUser._id.toString(), res);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
      token,
    });
  } catch (error: any) {
    next(createHttpError(500, error?.message));
  }
};

export { createUser };
