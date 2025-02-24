import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import _ from "lodash";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  sortingFns,
  getPaginationRowModel

} from "@tanstack/react-table";
import NewTransactionForm from "../components/NewTransactionForm";
import UpdateTransaction from "../components/UpadateTransaction";

const customSortingFns = {
  numeric: (rowA, rowB, columnId) => {
    return (
      parseFloat(rowA.getValue(columnId)) - parseFloat(rowB.getValue(columnId))
    );
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sorting, setSorting] = useState([])
  const [subcategories, setSubcategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0, 
    pageSize: 10, 
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    startDate: "",
    endDate: "",
    category: "",
    subcategory: "",
    paymentMethod: "",
    search: ""
  });
  const [showNewEntry, setShowNewEntry] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
        setName(response.data.user.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem("auth");
    if (authStatus == "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate("/"); 
    }
  }, []);


  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, paymentMethodsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/data/categories"),
          axios.get("http://localhost:5000/api/data/payment-methods"),
        ]);
        setCategories(categoriesRes.data);
        setPaymentMethods(paymentMethodsRes.data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!filters.category) {
        setSubcategories([]); 
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/data/subcategories?category=${filters.category}`);
        setSubcategories(response.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };

    fetchSubcategories();
  }, [filters.category]); 

  const fetchEntries = async () => {
    // console.log("Fetching transactions with filters:", filters);
    try {
      const response = await axios.get("http://localhost:5000/api/transactions", {
        params: filters,
        withCredentials: true, // Ensure cookies are sent
      });

      //console.log("API Response:", response.data);
      const data = response.data;
      const transactions = data?.transactions || []; // Default to an empty array if undefined
      setEntries(transactions);
      calculateSummary(transactions);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response) {
        console.log("Server Response:", error.response.data);
      }
    }
  };

  const debouncedFetchEntries = _.debounce(fetchEntries, 500);

  const handleInputChange = (e) => {
    setFilters((filters) => ({ ...filters, search: e.target.value }));
  };

  useEffect(() => {
    debouncedFetchEntries();
  }, [filters]);

  const calculateSummary = useCallback((data) => {
    let income = 0,
      expense = 0;
    data.forEach((entry) => {
      if (entry.type === "Income") income += entry.amount;
      else expense += entry.amount;
    });
    setTotalIncome(income);
    setTotalExpense(expense);
  }, []);

  // Function to group transactions by month
  const getMonthlyBreakdown = (entries) => {
    const breakdown = {};

    entries.forEach(({ amount, type, date }) => {
      const month = new Date(date).toLocaleString("default", { month: "long", year: "numeric" });

      if (!breakdown[month]) {
        breakdown[month] = { income: 0, expense: 0 };
      }

      if (type === "Income") {
        breakdown[month].income += amount;
      } else {
        breakdown[month].expense += amount;
      }
    });

    return breakdown;
  };

  // Get formatted data for display
  const monthlyData = getMonthlyBreakdown(entries);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFilters({ ...filters, category: selectedCategory, subcategory: "" });

    const selectedCategoryData = categories.find((cat) => cat.name === selectedCategory);
    // console.log("Selected Category Data:", selectedCategoryData); 

    if (selectedCategoryData && Array.isArray(selectedCategoryData.subcategories)) {
      setSubcategories(selectedCategoryData.subcategories);
    } else {
      setSubcategories([]); // Fallback to empty array
    }
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`,
        { withCredentials: true }
      );
      setFilters((prevFilters) => ({ ...prevFilters })); // Trigger fetchEntries
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction); // Store transaction in state
    setShowEditModal(true); // Show the edit modal
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTransaction(null);
  };


  const columns = useMemo(
    () => [
      { header: "Category", accessorKey: "category" },
      { header: "Subcategory", accessorKey: "subcategory" },
      { header: "Type", accessorKey: "type" },
      { header: "Payment Method", accessorKey: "paymentMethod" },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ getValue }) => `₹${getValue().toFixed(2)}`,
        sortingFn: "numeric",
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      },
      { header: "Description", accessorKey: "description" },
      {
        header: "Actions",
        id: "actions", // Unique key for the column
        cell: ({ row }) => {
          const transaction = row.original; // Get row data

          return (
            <div className="flex gap-2">
              {/* Edit button */}
              <button
                className="text-yellow-500 hover:text-yellow-600 p-1 rounded cursor-pointer"
                onClick={() => handleEdit(transaction)}
              >
                <Pencil size={18} />
              </button>

              {/* Delete button */}
              <button
                className="text-red-500 hover:text-red-600 p-1 rounded cursor-pointer"
                onClick={() => handleDelete(transaction._id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const handleTransactionAdded = (newTransaction) => {
    setEntries((prevEntries) => [newTransaction, ...prevEntries]); // Add new transaction to the top
    calculateSummary([newTransaction, ...entries]); // Update summary
  };

  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    sortingFns: customSortingFns,
  });


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-4 rounded shadow-lg">
        {name && (
          <h1
            className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2 animate-fadeIn"
          >
            Hi, {name} 👋
          </h1>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Income Container */}
          <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded shadow-md w-full text-center md:w-1/3">
            <p className="text-green-600 font-semibold text-lg">Total Income</p>
            <p className="text-green-800 text-xl font-bold">₹{totalIncome}</p>
          </div>

          {/* Expense Container */}
          <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded shadow-md w-full text-center md:w-1/3">
            <p className="text-red-600 font-semibold text-lg">Total Expense</p>
            <p className="text-red-800 text-xl font-bold">₹{totalExpense}</p>
          </div>

          {/* Balance Container */}
          <div className="bg-gray-100 border-l-4 p-4 rounded shadow-md w-full md:w-1/3 text-center border-gray-600">
            <p className="text-gray-600 font-semibold text-lg">Balance</p>
            <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{totalIncome - totalExpense}
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}

        <div className="overflow-x-auto mt-6 mb-6"> {/* Added bottom margin for spacing */}
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Monthly Breakdown</h2> {/* Increased heading size */}

          <div className="rounded-lg shadow-lg overflow-hidden"> {/* Wrapped in a container for better UI */}
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-4 text-left">Month</th>
                  <th className="p-4 text-right">Income (₹)</th>
                  <th className="p-4 text-right">Expenses (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthlyData).map(([month, { income, expense }], index) => (
                  <tr key={month} className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}>
                    <td className="p-4 font-medium text-gray-700">{month}</td>
                    <td className="p-4 text-right text-green-600 font-semibold">₹{income.toFixed(2)}</td>
                    <td className="p-4 text-right text-red-600 font-semibold">₹{expense.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 border rounded shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Type Filter */}
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="border p-2 rounded outline-none w-full"
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            {/* Category Filter */}
            <select
              name="category"
              value={filters.category}
              onChange={handleCategoryChange}
              className="border p-2 rounded outline-none w-full"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Subcategory Filter */}
            <select
              name="subcategory"
              value={filters.subcategory}
              onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
              className="border p-2 rounded outline-none w-full"
            >
              <option value="">All Subcategories</option>
              {subcategories.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              className="border p-2 rounded outline-none w-full"
            >
              <option value="">All Payment Methods</option>
              {paymentMethods.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          

          <div className="flex flex-col md:flex-row gap-4">
            {/* Start Date */}
            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-gray-600 font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="border p-2 rounded outline-none w-full"
              />
            </div>
            {/* End Date */}
            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-gray-600 font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="border p-2 rounded outline-none w-full"
              />
            </div>
            {/* Search */}
            <div className="flex flex-col w-full md:w-1/2">
              <label className="text-gray-600 font-medium mb-1">Description</label>
              <input
                type="text"
                placeholder="Search by description"
                value={filters.search}
                onChange={handleInputChange} // Call debounced function
                className="border p-2 rounded outline-none w-full"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end">
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={() => setShowNewEntry(true)}
          >
            Add New Entry
          </button>
        </div>
        {showNewEntry && <NewTransactionForm onClose={() => setShowNewEntry(false)} onTransactionAdded={handleTransactionAdded} />}

        {/* Transactions Table */}

        <div className="overflow-x-auto mt-4 p-4 bg-white shadow-lg rounded-lg">
          <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
            {/* Table Header */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="border-b px-5 py-3 text-left font-semibold uppercase tracking-wide"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc" ? " 🔼" : ""}
                      {header.column.getIsSorted() === "desc" ? " 🔽" : ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200 bg-gray-50">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => {
                  return (
                    <tr
                      key={row.id}

                      className={`border-b transition ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-200`}
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id} className="p-4 text-gray-700">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center p-6 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {showEditModal && selectedTransaction && (
            <UpdateTransaction
              transaction={selectedTransaction}
              onClose={closeEditModal} // Function to close the modal
              onUpdate={(updatedTransaction) => {
                setEntries((prevEntries) =>
                  prevEntries.map((entry) =>
                    entry._id === updatedTransaction._id ? updatedTransaction : entry
                  )
                );
              }}
            />
          )}
          <div className="flex items-center justify-center gap-2 mt-4">
            {/* First Page Button */}
            <button
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              {'<<'}
            </button>

            {/* Previous Page Button */}
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              {'<'}
            </button>

            {/* Next Page Button */}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              {'>'}
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              {'>>'}
            </button>

            {/* Page Size Selector */}
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="ml-4 p-2 border rounded bg-white text-gray-700"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
