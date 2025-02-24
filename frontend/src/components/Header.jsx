import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wallet } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/api/users/logout"); // Using GET instead of POST
      localStorage.removeItem("auth"); // Remove auth token
      localStorage.removeItem("user"); // Clear user details
      navigate("/", { replace: true }); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <header className="bg-blue-600 p-4 flex justify-between items-center">
      {/* Logo & Title */}
      <div className="flex items-center gap-2">
        <Wallet className="text-white" size={28} /> {/* Wallet Icon */}
        <h1 className="text-white text-2xl font-bold">Expensify</h1>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;

