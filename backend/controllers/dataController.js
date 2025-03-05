import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Subcategory from "../models/Subcategory.js";
import mongoose from "mongoose";
import { ErrorHandler } from "../utils/errorHandler.js";

// Get all categories
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json(categories);
});

// Get subcategories by category ID
export const getSubCategoryByCategoryId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ErrorHandler("Invalid Category ID", 400);
    }

    const subcategories = await Subcategory.find({ categories: id }).populate("categories");

    if (!subcategories.length) {
        throw new ErrorHandler("No subcategories found for this category", 404);
    }

    res.status(200).json(subcategories);
});

// Get all payment methods
export const getPaymentMethods = asyncHandler(async (req, res) => {
    const paymentMethods = await PaymentMethod.find();
    res.status(200).json(paymentMethods);
});
