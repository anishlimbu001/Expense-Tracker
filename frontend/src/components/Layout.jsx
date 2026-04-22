import React, { useState, useEffect, useMemo } from 'react';
import { styles } from '../assets/styles.js';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './SideBar.jsx';
import {
  Utensils, Home, Car, ShoppingCart, Gift, Zap, Activity,
  ArrowUp, CreditCard, PiggyBank, ArrowDown, RefreshCw,
  Clock, TrendingUp, Info, Banknote, ChevronUp, ChevronDown, PieChart
} from "lucide-react";
import axios from 'axios';

// ✅ FIX: use env variable instead of localhost
const API_BASE = import.meta.env.VITE_API_BASE;

const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Housing: <Home className="w-4 h-4" />,
  Transport: <Car className="w-4 h-4" />,
  Shopping: <ShoppingCart className="w-4 h-4" />,
  Entertainment: <Gift className="w-4 h-4" />,
  Utilities: <Zap className="w-4 h-4" />,
  Healthcare: <Activity className="w-4 h-4" />,
  Salary: <ArrowUp className="w-4 h-4" />,
  Freelance: <CreditCard className="w-4 h-4" />,
  Savings: <PiggyBank className="w-4 h-4" />,
};

const filterTransactions = (transactions, frame) => {
  const now = new Date();
  const today = new Date(now).setHours(0, 0, 0, 0);

  switch (frame) {
    case "daily":
      return transactions.filter((t) => new Date(t.date) >= today);

    case "weekly": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return transactions.filter((t) => new Date(t.date) >= startOfWeek);
    }

    case "monthly":
      return transactions.filter(
        (t) => new Date(t.date).getMonth() === now.getMonth()
      );

    default:
      return transactions;
  }
};

const safeArrayFromResponse = (res) => {
  const body = res?.data;
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.incomes)) return body.incomes;
  if (Array.isArray(body.expenses)) return body.expenses;
  return [];
};

function Layout({ onLogout, user }) {
  const [transactions, setTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_BASE}/income/get`, { headers }),
        axios.get(`${API_BASE}/expense/get`, { headers }),
      ]);

      const incomes = safeArrayFromResponse(incomeRes).map((i) => ({
        ...i,
        type: "income",
      }));

      const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
        ...e,
        type: "expense",
      }));

      const allTransactions = [...incomes, ...expenses]
        .map((t) => ({
          id: t._id || t.id || Math.random().toString(36).slice(2),
          description: t.description || t.title || t.note || "",
          amount: Number(t.amount ?? t.value ?? 0),
          date: t.date || t.createdAt || new Date().toISOString(),
          category: t.category || t.type || "Other",
          type: t.type,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err?.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const endpoint =
      transaction.type === "income" ? "income/add" : "expense/add";

    await axios.post(`${API_BASE}/${endpoint}`, transaction, { headers });
    await fetchTransactions();
  };

  const editTransaction = async (id, transaction) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const endpoint =
      transaction.type === "income" ? "income/update" : "expense/update";

    await axios.put(`${API_BASE}/${endpoint}/${id}`, transaction, { headers });
    await fetchTransactions();
  };

  const deleteTransaction = async (id, type) => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const endpoint =
      type === "income" ? "income/delete" : "expense/delete";

    await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers });
    await fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, timeFrame),
    [transactions, timeFrame]
  );

  const outletContext = {
    transactions: filteredTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    timeFrame,
    setTimeFrame,
    lastUpdated,
  };

  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  return (
    <div className={styles.layout.root}>
      <Navbar user={user} onLogout={onLogout} />

      <Sidebar
        user={user}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div className={styles.layout.mainContainer(sidebarCollapsed)}>
        <Outlet context={outletContext} />
      </div>
    </div>
  );
}

export default Layout;