import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import { ErrorHandler } from "../utils/errorHandler.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createTransaction = asyncHandler(async (req, res, next) => {
  const { type, category, subcategory, amount, paymentMethod, date, description } = req.body;

  if (!type || !category || !subcategory || amount == null || !paymentMethod || !date) {
    throw new ErrorHandler("All required fields must be provided", 400);
  }

  if (amount < 0) {
    throw new ErrorHandler("Amount cannot be negative", 400);
  }

  if (!isValidObjectId(category)) throw new ErrorHandler("Invalid Category ID", 400);
  const categoryData = await Category.findById(category);
  if (!categoryData) throw new ErrorHandler("Category not found", 404);

  if (!isValidObjectId(subcategory)) throw new ErrorHandler("Invalid Subcategory ID", 400);
  const subcategoryData = await Subcategory.findById(subcategory);
  if (!subcategoryData) throw new ErrorHandler("Subcategory not found", 404);

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    categoryId: categoryData._id,
    subcategoryId: subcategoryData._id,
    amount,
    paymentMethod,
    date,
    description,
  });

  res.status(201).json(transaction);
});

// Get Transactions with Filters
const getTransactions = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, categoryId, subcategoryId, paymentMethod, search } = req.query;

  let filters = { user: req.user._id };  

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }

  if (type) filters.type = type;
  if (isValidObjectId(categoryId)) filters.categoryId = categoryId;
  if (isValidObjectId(subcategoryId)) filters.subcategoryId = subcategoryId;
  if (paymentMethod) filters.paymentMethod = paymentMethod;
  if (search) filters.description = { $regex: search, $options: "i" }; 

  const transactions = await Transaction.find(filters)
    .populate("categoryId", "name")
    .populate("subcategoryId", "name")
    .lean();

  res.status(200).json({
    success: true,
    transactions: transactions.map((tx) => ({
      ...tx,
      category: tx.categoryId?.name || "Unknown",
      subcategory: tx.subcategoryId?.name || "Unknown",
    })),
    totalTransactions: transactions.length,
  });
});

// Update Transaction
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);   

  if (!transaction) {
    throw new ErrorHandler("Transaction not found", 404);
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    throw new ErrorHandler("Unauthorized to update this transaction", 401);
  }

  if (req.body.amount !== undefined && req.body.amount < 0) {
    throw new ErrorHandler("Amount cannot be negative", 400);
  }

  let categoryId = transaction.categoryId;
  if (req.body.category) {
    if (!isValidObjectId(req.body.category)) {
      throw new ErrorHandler("Invalid Category ID", 400);
    }
    const categoryData = await Category.findById(req.body.category);
    if (!categoryData) {
      throw new ErrorHandler("Category not found", 404);
    }
    categoryId = categoryData._id;
  }

  let subcategoryId = transaction.subcategoryId;
  if (req.body.subcategory) {
    if (!isValidObjectId(req.body.subcategory)) {
      throw new ErrorHandler("Invalid Subcategory ID", 400);
    }
    const subcategoryData = await Subcategory.findById(req.body.subcategory);
    if (!subcategoryData) {
      throw new ErrorHandler("Subcategory not found", 404);
    }
    subcategoryId = subcategoryData._id;
  }

  transaction.type = req.body.type ?? transaction.type;
  transaction.categoryId = categoryId;
  transaction.subcategoryId = subcategoryId;
  transaction.amount = req.body.amount ?? transaction.amount;
  transaction.paymentMethod = req.body.paymentMethod ?? transaction.paymentMethod;
  transaction.date = req.body.date ?? transaction.date;
  transaction.description = req.body.description ?? transaction.description;

  const updatedTransaction = await transaction.save();
  res.status(200).json(updatedTransaction);
});

// ✅ Delete Transaction
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new ErrorHandler("Transaction not found", 404);
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    throw new ErrorHandler("Unauthorized to delete this transaction", 401);
  }

  await transaction.deleteOne();
  res.status(200).json({ message: "Transaction deleted successfully" });
});

export {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
