import mongoose from "mongoose";
const { Schema } = mongoose;

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    subcategoryId: {
      type: Schema.Types.ObjectId, 
      ref: "Subcategory",
    },

    categoryId: {
      type: Schema.Types.ObjectId, 
      ref: "Category",
    },
    
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
