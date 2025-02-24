import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new transaction
router.post("/add", isAuthenticated, createTransaction);

// Get all transactions with filtering
router.get("/", isAuthenticated, getTransactions);

// Get financial summary
// router.get("/summary", isAuthenticated, getFinancialSummary);

// Update a transaction
router.put("/:id", isAuthenticated, updateTransaction);

// Delete a transaction
router.delete("/:id", isAuthenticated, deleteTransaction);

export default router;
