import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { expenses } = req.body;

    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      { expenses }
    );

    res.json(response.data);
  } catch (err) {
    console.log("ML route error:", err.message);
    res.status(500).json({ error: "ML prediction failed" });
  }
});

export default router;