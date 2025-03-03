import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AuthPage = ({ setIsAuthenticated }) => {  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth === "true") navigate("/home");  
  }, [navigate]);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      toast.error("Please fill all required fields!");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "http://localhost:5000/api/users/login"
        : "http://localhost:5000/api/users/new";

      const payload = isLogin ? { email, password } : { name, email, password };

      const { data } = await axios.post(endpoint, payload, { withCredentials: true });

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("auth", "true");
      setIsAuthenticated(true); 

      toast.success(isLogin ? "Login successful!" : "Registration successful!");

      setTimeout(() => navigate("/home", { replace: true }), 500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-2 mb-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <button
          className={`w-full p-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
          }`}
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>

        <p className="text-center mt-2 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
