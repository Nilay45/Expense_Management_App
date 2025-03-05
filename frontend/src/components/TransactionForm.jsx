import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../main";

const TransactionForm = ({ transaction, onClose, onSuccess, isEditMode }) => {
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

    // Fetch categories and payment methods on mount
    useEffect(() => {
        const fetchFields = async () => {
            try {
                const [categoriesRes, paymentMethodsRes] = await Promise.all([
                    axios.get(`${server}/data/categories`),
                    axios.get(`${server}/data/payment-methods`),
                    // `${server}/users/login`,
                ]);
                setCategories(categoriesRes.data);
                setPaymentMethods(paymentMethodsRes.data);
            } catch (error) {
                console.error("Error fetching filters:", error);
                toast.error("Failed to load categories or payment methods.");
            }
        };

        fetchFields();
    }, []);

    // Fetch subcategories when category changes
    const fetchSubcategories = async () => {
        if (!formData.category) {
            setSubcategories([]);
            return;
        }
        try {
            const response = await axios.get(
                `${server}/data/subcategories/${formData.category}`
            );
            setSubcategories(response.data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            setSubcategories([]);
        }
    };

    useEffect(() => {
        if (formData.category) {
          fetchSubcategories(formData.category);
        } else {
          setSubcategories([]); 
        }
      }, [formData.category]);


    useEffect(() => {
        if (isEditMode && transaction) {
            setFormData({
                amount: transaction.amount || "",
                type: transaction.type || "Income",
                category: transaction.categoryId?._id ||  "",
                subcategory: transaction.subcategoryId?._id || "",
                paymentMethod: transaction.paymentMethod || "",
                description: transaction.description || "",
                date: transaction.date ? transaction.date.split("T")[0] : "",
            });
        }
    }, [isEditMode, transaction]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "category") {
            setFormData({
                ...formData,
                category: value,
                subcategory: "", 
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || formData.amount <= 0 || !formData.category || !formData.subcategory || !formData.paymentMethod || !formData.date) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            let response;
            if (isEditMode) {
                response = await axios.put(
                    `${server}/transactions/${transaction._id}`,
                    formData,
                    { withCredentials: true }
                );
                toast.success("Transaction updated successfully!");
            } else {
                response = await axios.post(
                    `${server}/transactions/add`,
                    formData,
                    { withCredentials: true }
                );
                toast.success("Transaction added successfully!");
            }

            onSuccess(response.data);
            onClose();
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">
                    {isEditMode ? "Edit Transaction" : "Add New Transaction"}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        className="border p-2"
                        value={formData.amount}
                        onChange={(e) => {
                            const value = (e.target.value);
                            if (value < 0) {
                              toast.error("Amount must be greater than zero");
                              return;
                            }
                            setFormData({ ...formData, amount: value });
                        }}
                        required
                    />
                    <select
                        name="type"
                        className="border p-2"
                        value={formData.type}
                        onChange={handleChange}
                    >
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
                        onChange={handleCategoryChange}
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
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
                            <option key={sub._id} value={sub._id}>
                                {sub.name}
                            </option>
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
                            <option key={method.name} value={method.name}>
                                {method.name}
                            </option>
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
                        <button
                            type="button"
                            className="bg-gray-400 px-4 py-2 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {isEditMode ? "Update Transaction" : "Add Transaction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
