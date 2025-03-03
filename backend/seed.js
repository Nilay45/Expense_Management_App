import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";
import Subcategory from "./models/SubCategory.js";
import PaymentMethod from "./models/PaymentMethod.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const seedDatabase = async () => {
  try {
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await PaymentMethod.deleteMany();

    console.log("Existing data cleared...");

    const categoriesData = [
      { name: "Salary" },
      { name: "Business" },
      { name: "Investment" },
      { name: "Food" },
      { name: "Transportation" },
      { name: "Entertainment" },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log("Categories seeded...");

    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Seed subcategories (some mapped to multiple categories)
    const subcategoriesData = [
      { name: "Bonus", categories: [categoryMap["Salary"], categoryMap["Business"]] },
      { name: "Investments", categories: [categoryMap["Business"], categoryMap["Investment"]] },
      { name: "Monthly Salary", categories: [categoryMap["Salary"]] },
      { name: "Freelancing", categories: [categoryMap["Business"]] },
      { name: "Groceries", categories: [categoryMap["Food"]] },
      { name: "Restaurants", categories: [categoryMap["Food"]] },
      { name: "Fuel", categories: [categoryMap["Transportation"]] },
      { name: "Public Transport", categories: [categoryMap["Transportation"]] },
      { name: "Movies", categories: [categoryMap["Entertainment"]] },
      { name: "Gaming", categories: [categoryMap["Entertainment"]] },
    ];

    await Subcategory.insertMany(subcategoriesData);
    console.log("Subcategories seeded...");

    // Seed payment methods
    const paymentMethodsData = [
      { name: "Cash" },
      { name: "Credit Card" },
      { name: "Bank Transfer" },
      { name: "UPI" },
      { name: "Net Banking" },
    ];

    await PaymentMethod.insertMany(paymentMethodsData);
    console.log("Payment methods seeded...");

    console.log("Database Seeded Successfully!");
    process.exit();
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
};

seedDatabase();
