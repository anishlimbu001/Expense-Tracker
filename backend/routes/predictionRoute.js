import express from "express";
import Expense from "../models/expenseModel.js";

const router = express.Router();

router.get("/predict/:userId", async (req, res) => {

  const { userId } = req.params;

  const expenses = await Expense.find({
    userId: userId
  }).sort({ date: 1 });

  if (expenses.length < 2)
    return res.json({ prediction: 0 });

  const x = [];
  const y = [];

  expenses.forEach((e, i) => {
    x.push(i + 1);
    y.push(e.amount);
  });

  const n = x.length;

  const sumX = x.reduce((a,b)=>a+b,0);
  const sumY = y.reduce((a,b)=>a+b,0);
  const sumXY = x.reduce((a,b,i)=>a+b*y[i],0);
  const sumXX = x.reduce((a,b)=>a+b*b,0);

  const slope =
    (n*sumXY - sumX*sumY) /
    (n*sumXX - sumX*sumX);

  const intercept =
    (sumY - slope*sumX)/n;

  const prediction = slope*(n+1)+intercept;

  res.json({
    prediction: prediction.toFixed(2),
    history: y
  });
});

export default router;