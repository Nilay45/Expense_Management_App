import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { server } from "../main";

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${server}/users/logout`, { withCredentials: true });

      localStorage.removeItem("auth");
      localStorage.removeItem("user");
      setIsAuthenticated(false);

      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/", { replace: true }), 300);
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <header className="bg-blue-600 p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {/* <Wallet className="text-white" size={28} /> */}
        <img src="/expensify.png" alt="Expensify Logo" className="h-10 w-10" />
        <h1 className="text-white text-2xl font-bold">Expensify</h1>
      </div>

      {/* Show Logout button only if authenticated */}
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200 cursor-pointer"
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default Header;
