import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';

import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRoute.js';
import dashboardRouter from './routes/dashboardRoute.js';
import router from './routes/predictionRoute.js';
import mlRoute from './routes/ml.routes.js';

console.log("STARTING SERVER");

const app = express();
const port = process.env.PORT || 4000;

// ✅ MIDDLEWARES
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://expense-tracker-anishlimbu001s-projects.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/predict", router);
app.use("/api/ml", mlRoute);

app.get('/', (req, res) => {
  res.send("API WORKING");
});

// ✅ DATABASE + SERVER (CORRECT WAY)
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB CONNECTION FAILED:", err);
  });