
import jwt from "jsonwebtoken";

export const sendCookie = (user, res, message, statusCode = 200) => {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res
        .status(statusCode)
        .cookie("token", token, {
            httpOnly: true, // Prevent JavaScript access
            secure: process.env.NODE_ENV !== "development", // Secure in production
            sameSite: "lax", // Allow cookies across subdomains
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .json({
            success: true,
            message,
            user,
        });
};
