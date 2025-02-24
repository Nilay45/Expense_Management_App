import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";
import PaymentMethod from "./models/PaymentMethod.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany();
    await PaymentMethod.deleteMany();

    // Seed categories with subcategories
    const categories = [
      {
        name: "Salary",
        type: "Income",
        subcategories: [{ name: "Monthly Salary" }, { name: "Bonus" }, { name: "Freelancing" }],
      },
      {
        name: "Business",
        type: "Income",
        subcategories: [{ name: "Sales Revenue" }, { name: "Investments" }],
      },
      {
        name: "Food",
        type: "Expense",
        subcategories: [{ name: "Groceries" }, { name: "Restaurants" }, { name: "Fast Food" }],
      },
      {
        name: "Transportation",
        type: "Expense",
        subcategories: [{ name: "Fuel" }, { name: "Public Transport" }, { name: "Taxi" }],
      },
      {
        name: "Entertainment",
        type: "Expense",
        subcategories: [{ name: "Movies" }, { name: "Music" }, { name: "Gaming" }],
      },
    ];

    // Seed payment methods
    const paymentMethods = [
      { name: "Cash" },
      { name: "Credit Card" },
      { name: "Bank Transfer" },
      { name: "UPI" },
      { name: "Net Banking" },
    ];

    await Category.insertMany(categories);
    await PaymentMethod.insertMany(paymentMethods);

    console.log("Database Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
};

seedDatabase();
