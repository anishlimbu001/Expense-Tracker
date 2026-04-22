import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Income from "./pages/Income.jsx";
import Expense from "./pages/Expense.jsx";
import Profile from "./pages/Profile.jsx";
import axios from "axios";
import Prediction from "./pages/Prediction.jsx";

const API_URL = import.meta.env.VITE_API_URL;

// Helper to get transactions from localStorage
const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
};

// Protect routes
const ProtectedRoute = ({ user, children }) => {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  const hasToken = localToken || sessionToken;

  if (!user || !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);
  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("user", JSON.stringify(userObj));
        sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    if (localToken) localStorage.setItem("user", JSON.stringify(updatedUser));
    else if (sessionToken) sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Load user on page refresh
  useEffect(() => {
    (async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        const tokenFromLocal = !!localStorage.getItem("token");

        if (storedUser && storedToken) {
          try {
            const res = await axios.get(`${API_URL}/user/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const profile = res.data.user;
            persistAuth(profile, storedToken, tokenFromLocal);
          } catch (fetchErr) {
            console.warn("Could not fetch profile from stored token:", fetchErr);
            clearAuth();
          }
        }
      } catch (err) {
        console.error("Error bootstrapping auth:", err);
      } finally {
        setIsLoading(false);
        try {
          setTransactions(getTransactionsFromStorage());
        } catch (txErr) {
          console.error("Error loading transactions:", txErr);
        }
      }
    })();
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate("/");
  };

  const handleSignup = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate("/");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Transaction helpers
  const addTransaction = (newTransaction) => setTransactions((p) => [newTransaction, ...p]);
  const editTransaction = (id, updatedTransaction) =>
    setTransactions((p) => p.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)));
  const deleteTransaction = (id) => setTransactions((p) => p.filter((t) => t.id !== id));
  const refreshTransactions = () => setTransactions(getTransactionsFromStorage());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
  <Route path="/login" element={<Login onLogin={handleLogin} />} />
  <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

  <Route
    element={
      <ProtectedRoute user={user}>
        <Layout
          user={user}
          onLogout={handleLogout}
          transactions={transactions}
          addTransaction={addTransaction}
          editTransaction={editTransaction}
          deleteTransaction={deleteTransaction}
          refreshTransactions={refreshTransactions}
        />
      </ProtectedRoute>
    }
  >
    <Route
      path="/"
      element={
        <Dashboard
          transactions={transactions}
          addTransaction={addTransaction}
          editTransaction={editTransaction}
          deleteTransaction={deleteTransaction}
          refreshTransactions={refreshTransactions}
        />
      }
    />

    <Route
      path="/income"
      element={
        <Income
          transactions={transactions}
          addTransaction={addTransaction}
          editTransaction={editTransaction}
          deleteTransaction={deleteTransaction}
          refreshTransactions={refreshTransactions}
        />
      }
    />

    <Route
      path="/expense"
      element={
        <Expense
          transactions={transactions}
          addTransaction={addTransaction}
          editTransaction={editTransaction}
          deleteTransaction={deleteTransaction}
          refreshTransactions={refreshTransactions}
        />
      }
    />

    <Route
      path="/profile"
      element={
        <Profile
          user={user}
          onUpdateProfile={updateUserData}
          onLogout={handleLogout}
        />
      }
    />

    {/* ✅ FIX HERE */}
    <Route path="/prediction" element={<Prediction />} />
  </Route>

  <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
</Routes>
      
    </>
  );
}

export default App;