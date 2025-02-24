import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const NewTransactionForm = ({ onClose, onTransactionAdded }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "Income",
    category: "",
    subcategory: "",
    paymentMethod: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data/payment-methods"); // Fixed API URL
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const fetchSubcategories = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/data/subcategories?category=${category}`);
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.subcategory || !formData.paymentMethod || !formData.date) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/transactions/add", formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
    });
      onTransactionAdded(response.data);
      onClose();
      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div className="fixed inset-5  bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            placeholder="Amount"
            className="border p-2"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />
          <select
            className="border p-2"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <input
            type="date"
            className="border p-2"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <select
            className="border p-2"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            className="border p-2"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            required
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.name} value={sub.name}>{sub.name}</option>
            ))}
          </select>

          <select
            className="border p-2"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            required
          >
            <option value="">Select Payment Method</option>
            {paymentMethods.map((method) => (
              <option key={method.name} value={method.name}>
                {method.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Description (optional)"
            className="border p-2"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          ></textarea>

          <div className="flex justify-end gap-2">
            <button type="button" className="bg-gray-400 px-4 py-2 rounded cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default NewTransactionForm;
