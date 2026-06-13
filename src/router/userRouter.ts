import express from "express";
import { createUser, login, logout } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createUser);

router.post("/login", login);

router.get("/logout", logout);

export default router;
