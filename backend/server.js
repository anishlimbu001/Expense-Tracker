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

const app = express();
const port = 4000;

// ✅ MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ DATABASE
connectDB();

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

// ✅ SERVER
app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});