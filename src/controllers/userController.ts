import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import generateToken from "../middleware/tokenGenerate.js";

// Create user controller
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

    // Database call
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

// Login controller
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      const error = createHttpError(401, "Invalid credentials");
      return next(error);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      const error = createHttpError(401, "Invalid credentials");
      return next(error);
    }

    const token = generateToken(user._id.toString(), res);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: user,
      token,
    });
  } catch (error: any) {
    next(createHttpError(500, error?.message));
  }
};

export { createUser, login };
