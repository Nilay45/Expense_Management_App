import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { ErrorHandler } from "../utils/errorHandler.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        throw new ErrorHandler("Unauthorized: Please log in first", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    req.user = user;
    next();
});




