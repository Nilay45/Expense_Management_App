import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { sendCookie } from "../utils/generateToken.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import asyncHandler from "express-async-handler";

export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) throw new ErrorHandler("User Already Exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, password: hashedPassword });

    sendCookie(user, res, "Registered Successfully", 201);
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    if (!user) throw new ErrorHandler("Invalid Email or Password", 400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ErrorHandler("Invalid Email or Password", 400);

    sendCookie(user, res, `Welcome back, ${user.name}`, 200);
});

export const getMyProfile = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

export const logout = (req, res) => {
    res.status(200)
        .clearCookie("token", {
            httpOnly: true, 
            secure: process.env.NODE_ENV !== "development", 
        })
        .json({
            success: true,
            message: "Logged out successfully",
        });
};
