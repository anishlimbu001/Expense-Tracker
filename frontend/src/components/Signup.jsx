import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupStyles } from "../assets/styles";
import { ArrowLeft, EyeOff, Eye, Mail, Lock, User } from "lucide-react";
import axios from "axios";

const Signup = ({ onSignup }) => {
  // ✅ FIX: use Vite env instead of localhost fallback
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // validate password
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must include uppercase letter";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
      return "Must include special character";
    return "";
  };

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

  // validate form
  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email";
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data || {};
      const token = data.token ?? null;

      let profile = data.user ?? null;

      if (!profile) {
        const copy = { ...data };
        delete copy.token;
        delete copy.user;

        if (Object.keys(copy).length) profile = copy;
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (err) {
          console.warn("Profile fetch failed:", err);
        }
      }

      if (!profile) profile = { name, email };

      persistAuth(profile, token);

      if (typeof onSignup === "function") {
        onSignup(profile, rememberMe, token);
      }

      navigate("/login");

      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Signup error:", err);

      if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "Signup failed" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        {/* HEADER */}
        <div className={signupStyles.header}>
          <button onClick={() => navigate(-1)} className={signupStyles.backButton}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className={signupStyles.avatar}>
            <User className="w-10 h-10 text-white" />
          </div>

          <h1 className={signupStyles.headerTitle}>Create Account</h1>
        </div>

        {/* FORM */}
        <div className={signupStyles.formContainer}>
          {errors.api && (
            <p className={signupStyles.apiError}>{errors.api}</p>
          )}

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
            {errors.name && <p>{errors.name}</p>}

            {/* EMAIL */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            {errors.email && <p>{errors.email}</p>}

            {/* PASSWORD */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.password && <p>{errors.password}</p>}

            {/* REMEMBER */}
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>

            {/* BUTTON */}
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;