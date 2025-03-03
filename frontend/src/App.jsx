import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    setIsAuthenticated(auth === "true");
    setLoading(false); 
  }, []);

  if (loading) return null;  

  return (
    <Router>
      <ToastContainer position="top-center" autoClose={1500} />
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/home" element={isAuthenticated ? <HomePage setIsAuthenticated={setIsAuthenticated}/> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
