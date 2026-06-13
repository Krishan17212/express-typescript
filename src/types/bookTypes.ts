import { Document } from "mongoose";
import type { User } from "./userTypes.js";

export interface Book extends Document {
  title: string;
  author: User;
  genre: string;
  coverImage: string;
  file: string;
}
