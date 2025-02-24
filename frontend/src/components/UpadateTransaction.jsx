import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const UpdateTransactionForm = ({ transaction, onClose, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "",
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
    if (transaction) {
      setFormData({
        ...transaction,
        date: transaction.date ? transaction.date.split("T")[0] : "", 
      });

      if (transaction.category) {
        fetchSubcategories(transaction.category).then(() => {
          setFormData((prev) => ({
            ...prev,
            subcategory: transaction.subcategory || "", 
          }));
        });
      }
    }
  }, [transaction]);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category).then(() => {
        if (!formData.subcategory) {
          setFormData((prev) => ({
            ...prev,
            subcategory: subcategories.length ? subcategories[0].name : "",
          }));
        }
      });
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

  const fetchSubcategories = async (category) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/data/subcategories?category=${category}`);
      setSubcategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data/payment-methods");
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/transactions/${transaction._id}`,
        formData,
        { withCredentials: true }
      );
      toast.success("Transaction updated successfully!");
      onUpdate(data); 
      onClose(); 
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            className="border p-2"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <select name="type" className="border p-2" value={formData.type} onChange={handleChange}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <input
            type="date"
            name="date"
            className="border p-2"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            className="border p-2"
            value={formData.category}
            onChange={(e) => {
              setFormData({ ...formData, category: e.target.value, subcategory: "" });
              fetchSubcategories(e.target.value);
            }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <select
            name="subcategory"
            className="border p-2"
            value={formData.subcategory}
            onChange={handleChange}
            required
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.name} value={sub.name}>{sub.name}</option>
            ))}
          </select>

          <select
            name="paymentMethod"
            className="border p-2"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="">Select Payment Method</option>
            {paymentMethods.map((method) => (
              <option key={method.name} value={method.name}>{method.name}</option>
            ))}
          </select>

          <textarea
            name="description"
            placeholder="Description (optional)"
            className="border p-2"
            value={formData.description}
            onChange={handleChange}
          ></textarea>

          <div className="flex justify-end gap-2">
            <button type="button" className="bg-gray-400 px-4 py-2 rounded cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" onClick={handleSubmit}>
              Update Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTransactionForm;
