import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import transactionRoutes from "./routes/transactionRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Database Connection
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ Fixed CORS
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json()); // Parse JSON requests
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/data", dataRoutes);

// Error Handling Middleware
app.use(errorMiddleware); // ✅ No `isAuthenticated` here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

