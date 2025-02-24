import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

const createTransaction = asyncHandler(async (req, res) => {
  const { type, category, subcategory, amount, paymentMethod, date, description } = req.body;

  if (!type || !category || !subcategory || amount == null || !paymentMethod || !date) {
    res.status(400);
    throw new Error("All required fields must be provided");
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    category,
    subcategory,
    amount,
    paymentMethod,
    date,
    description,
  });

  res.status(201).json(transaction);
});

const getTransactions = asyncHandler(async (req, res) => {

  const { startDate, endDate, type, category, subcategory, paymentMethod, search } = req.query;

  let filters = { user: req.user._id };

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }
  if (type) filters.type = type;
  if (category) filters.category = category;
  if (subcategory) filters.subcategory = subcategory;
  if (paymentMethod) filters.paymentMethod = paymentMethod;
  if (search) filters.description = { $regex: search, $options: "i" }; 

  const transactions = await Transaction.find(filters);

  res.json({
    success: true,
    transactions,
    totalTransactions: transactions.length, 
  });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Unauthorized to update this transaction");
  }

  transaction.type = req.body.type ?? transaction.type;
  transaction.category = req.body.category ?? transaction.category;
  transaction.subcategory = req.body.subcategory ?? transaction.subcategory;
  transaction.amount = req.body.hasOwnProperty("amount") ? req.body.amount : transaction.amount;
  transaction.paymentMethod = req.body.paymentMethod ?? transaction.paymentMethod;
  transaction.date = req.body.date ?? transaction.date;
  transaction.description = req.body.description ?? transaction.description;

  const updatedTransaction = await transaction.save();
  res.json(updatedTransaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Unauthorized to delete this transaction");
  }

  await transaction.deleteOne(); 
  res.json({ message: "Transaction deleted successfully" });
});

export {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
