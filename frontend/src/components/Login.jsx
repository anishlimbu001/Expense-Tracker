import React, { useState } from "react";
import { loginStyles } from "../assets/styles";
import { User, Lock, Mail, EyeOff, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ onLogin }) => {
  // ✅ Use Vite env (Render backend URL)
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // fetch profile
  const fetchProfile = async (token) => {
    if (!token) return null;

    const res = await axios.get(`${API_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };

  // persist auth
  const persistAuth = (profile, token) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    try {
      if (token) storage.setItem("token", token);
      if (profile) storage.setItem("user", JSON.stringify(profile));
    } catch (err) {
      console.error("Storage Error:", err);
    }
  };

  // login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/user/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data || {};
      const token = data.token || null;

      let profile = data.user ?? null;

      if (!profile) {
        const copy = { ...data };
        delete copy.token;
        delete copy.user;

        if (Object.keys(copy).length) {
          profile = copy;
        }
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn("Could not fetch profile:", fetchErr);
          profile = { email };
        }
      }

      if (!profile) profile = { email };

      persistAuth(profile, token);

      if (typeof onLogin === "function") {
        onLogin(profile, rememberMe, token);
      }

      navigate("/");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);

      const serverMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Login failed";

      setError(typeof serverMsg === "string"
        ? serverMsg
        : JSON.stringify(serverMsg)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={loginStyles.pageContainer}>
      <div className={loginStyles.cardContainer}>
        <div className={loginStyles.header}>
          <div className={loginStyles.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>

          <h1 className={loginStyles.headerTitle}>Welcome Back</h1>

          <p className={loginStyles.headerSubtitle}>
            Sign in to your ExpenseTracker account
          </p>
        </div>

        <div className={loginStyles.formContainer}>
          {error && (
            <div className={loginStyles.errorContainer}>
              <span className={loginStyles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="mb-6">
              <label className={loginStyles.label}>Email Address</label>

              <div className={loginStyles.inputContainer}>
                <Mail className="w-5 h-5" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={loginStyles.input}
                  placeholder="your@example.com"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-6">
              <label className={loginStyles.label}>Password</label>

              <div className={loginStyles.inputContainer}>
                <Lock className="w-5 h-5" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={loginStyles.passwordInput}
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className={loginStyles.checkboxContainer}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <label>Remember Me</label>
            </div>

            {/* BUTTON */}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* SIGN UP */}
          <p>
            Don't have an account?{" "}
            <Link to="/signup">Create One</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;