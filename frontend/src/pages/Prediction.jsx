import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Prediction = () => {
  const [prediction, setPrediction] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  useEffect(() => {
    if (userId) fetchPrediction();
  }, [userId]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(
        "http://localhost:4000/api/expense/get",
        { headers }
      );

      const expenses = res.data
        .map((item) => Number(item.amount))
        .filter((val) => !isNaN(val));

      const mlRes = await axios.post(
        "http://localhost:4000/api/ml/predict",
        { expenses }
      );

      setPrediction(Math.round(mlRes.data.prediction));

      setHistory(
        mlRes.data.history.map((val, i) => ({
          index: i + 1,
          amount: val,
        }))
      );
    } catch (err) {
      console.log("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Currency formatter
  const formatRupee = (value) => `रु ${value}`;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-2xl font-bold">AI Expense Prediction</h1>
        <p className="text-gray-500">
          Based on your past spending pattern
        </p>
      </div>

      {/* Prediction Card */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow">
        <h2 className="text-lg">Next Month Prediction</h2>

        {loading ? (
          <p className="text-xl mt-2">Calculating...</p>
        ) : (
          <p className="text-3xl font-bold mt-2">
            रु {prediction}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow h-96">
        <h3 className="font-semibold mb-3">Spending Trend</h3>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>

            <XAxis dataKey="index" />

            {/* ✅ Y-axis with NPR */}
            <YAxis tickFormatter={formatRupee} />

            {/* ✅ Tooltip with NPR */}
            <Tooltip formatter={(value) => formatRupee(value)} />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366F1"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Prediction;