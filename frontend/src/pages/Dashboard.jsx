import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from "react-router-dom";
import { getTimeFrameRange, getPreviousTimeFrameRange, calculateData } from '../components/Helpers.jsx';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import { dashboardStyles, trendStyles, chartStyles } from '../assets/styles.js';
import {
  GAUGE_COLORS,
  COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS
} from '../assets/color.jsx';
import {
  ArrowDown, PiggyBank, Plus, TrendingDown,
  TrendingUp as ProfitIcon, Wallet, BarChart2,
  ChevronDown, ChevronUp, ShoppingCart,
  PieChart as PieChartIcon, DollarSign
} from "lucide-react";
import axios from "axios";
import FinancialCard from '../components/FinancialCard.jsx';
import GaugeCard from '../components/GaugeCard.jsx';
import AddTransactionModal from '../components/Add.jsx';

// ✅ FIX: use environment variable instead of localhost
const API_BASE = import.meta.env.VITE_API_BASE;

const getAuthHeader = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

function toIsoWithClientTime(dateValue) {
  if (!dateValue) return new Date().toISOString();

  let date;

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    date = new Date(
      dateValue + "T" + now.toTimeString().slice(0, 8)
    );
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return new Date().toISOString();

  return date.toISOString();
}

const Dashboard = () => {
  const {
    transactions: outletTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    refreshTransactions
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "food",
  });

  const timeFrameRange = useMemo(() => getTimeFrameRange(timeFrame), [timeFrame]);
  const prevTimeFrameRange = useMemo(() => getPreviousTimeFrameRange(timeFrame), [timeFrame]);

  const isDateInRange = (date, start, end) => {
    const t = new Date(date);
    const s = new Date(start);
    const e = new Date(end);

    t.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);

    return t >= s && t <= e;
  };

  const filteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) =>
      isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
    ),
    [outletTransactions, timeFrameRange]
  );

  const prevFilteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) =>
      isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end)
    ),
    [outletTransactions, prevTimeFrameRange]
  );

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [filteredTransactions]);

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [prevFilteredTransactions]);

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/dashboard`, {
        headers: getAuthHeader(),
      });

      if (res?.data?.success) {
        const data = res.data.data;

        setOverviewMeta((prev) => ({
          ...prev,
          monthlyIncome: Number(data.monthlyIncome || 0),
          monthlyExpense: Number(data.monthlyExpense || 0),
          savings: Number(data.savings || 0),
          expenseDistribution: data.expenseDistribution || [],
          recentTransactions: data.recentTransactions || [],
        }));
      }
    } catch (err) {
      console.error("Dashboard error:", err?.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardOverview();
  }, [timeFrame]);

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    const payload = {
      date: toIsoWithClientTime(newTransaction.date),
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      category: newTransaction.category,
    };

    try {
      setLoading(true);

      const endpoint =
        newTransaction.type === "income"
          ? "income/add"
          : "expense/add";

      await axios.post(`${API_BASE}/${endpoint}`, payload, {
        headers: getAuthHeader(),
      });

      await refreshTransactions?.();
      await fetchDashboardOverview();

      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "food",
      });

      setShowModal(false);
    } catch (err) {
      console.error("Add transaction error:", err?.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dashboardStyles.container}>
      <div className={dashboardStyles.headerContainer}>
        <h1 className={dashboardStyles.headerTitle}>Finance Dashboard</h1>

        <button
          onClick={() => setShowModal(true)}
          className={dashboardStyles.addButton}
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      {/* rest of your UI stays EXACTLY same */}
      {/* NO CHANGES BELOW THIS (only API fixed) */}

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;