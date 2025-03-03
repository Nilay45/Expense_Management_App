import jwt from "jsonwebtoken";

export const sendCookie = (user, res, message, statusCode = 200) => {
    // Generate a JWT with the user's _id as the payload
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set the HTTP status code and cookie in the response
    res
        .status(statusCode)
        .cookie("token", token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV !== "development", // Send cookie only over HTTPS in production
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set cookie expiration to 7 days
        })
        // Send a JSON response indicating success
        .json({
            success: true, // Indicate the operation was successful
            message, // Include the success message
            user, // Include the user object in the response
        });
};
