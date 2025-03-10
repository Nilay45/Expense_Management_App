import express from "express";
import { register, login, logout, getMyProfile } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/new", register);

router.post("/login", login);

router.post("/logout", logout); 

router.get("/me", isAuthenticated, getMyProfile);


export default router;
