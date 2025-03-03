import express from "express";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/add", isAuthenticated, createTransaction);
router.get("/", isAuthenticated, getTransactions);
router.put("/:id", isAuthenticated, updateTransaction);
router.delete("/:id", isAuthenticated, deleteTransaction);

export default router;
