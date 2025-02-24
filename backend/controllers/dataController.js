import Category from "../models/Category.js";
import PaymentMethod from "../models/PaymentMethod.js";

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, { name: 1, type: 1, _id: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Get subcategories based on a category
export const getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const categoryData = await Category.findOne({ name: category });
    if (!categoryData) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(categoryData.subcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories", error });
  }
};

// Get all payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({}, { name: 1, type: 1, _id: 1 });
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment methods", error });
  }
};
