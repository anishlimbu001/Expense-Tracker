from flask import Flask, request, jsonify
from flask_cors import CORS

import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return {"message": "AI ML Service Running 🚀"}


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    expenses = data["expenses"]

    if len(expenses) < 2:
        return jsonify({
            "prediction": 0,
            "history": expenses
        })

    # ✅ Create training data
    X = np.array(range(len(expenses))).reshape(-1, 1)
    y = np.array(expenses)

    # ✅ Train ML model
    model = LinearRegression()
    model.fit(X, y)

    # ✅ Predict next value
    next_index = np.array([[len(expenses)]])
    prediction = model.predict(next_index)[0]

    return jsonify({
        "prediction": round(float(prediction)),
        "history": expenses
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)