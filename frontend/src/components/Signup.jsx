import React, {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupStyles } from '../assets/styles';
import { ArrowLeft, EyeOff, Eye, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';

const Signup = ({API_URL = "http://localhost:4000/api", onSignup}) => {
const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must include at least one special character";
  return "";
};

  // to fetch Profile
  const fetchProfile = async (token) => {
        if(!token) return null;
        const res= await axios.get(`${API_URL}/user/me`, {
            headers: {Authorization: `Bearer ${token}`},
        });
        return res.data;
    };
    
    const persistAuth = (profile, token) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        try{
            if(token) storage.setItem("token", token);
            if(profile) storage.setItem("user",JSON.stringify(profile));
        }catch(err){
            console.error("Storage Error:", err);
        }
    };

    //validate fields
    const validateForm = () => {
  const newErrors = {};

  if (!name.trim()) {
    newErrors.name = "Name is required";
  }
  if (!email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = "Email is invalid";
  }

const passwordError = validatePassword(password);
if (passwordError) newErrors.password = passwordError;

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  // to signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if(!validateForm()) return;
    setIsLoading(true);
    try{
        const res = await axios.post(
            `${API_URL}/user/register`,
            {name, email, password},
            {headers: {"content-Type": "application/json"} },
        );
     const data = res.data || {};
      const token = data.token ?? null;
      let profile = data.user ?? null;
      if (!profile) {
        // check for any extra fields returned that could be user info
        const copy = { ...data };
        delete copy.token;
        delete copy.user;
        if (Object.keys(copy).length) profile = copy;
      }

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (fetchErr) {
          console.warn("Could not fetch profile after signup token:", fetchErr);
          profile = null;
        }
      }

      if (!profile) profile = { name, email };
      persistAuth(profile, token);
      if (typeof onSignup === "function") {
        try {
          onSignup(profile, rememberMe, token);
        } catch (callErr) {
          console.warn("onSignup threw:", callErr);
          navigate("/");
        }
      } else {
        navigate("/");
      }
      setPassword("");
    }
catch (err) {
      console.error("Signup error:", err?.response || err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "An unexpected error occurred" });
      }
    } finally{
        setIsLoading(false);
    }
  };
  return (
    <div className={signupStyles.pageContainer}>
    <div className={signupStyles.cardContainer}>
    <div className={signupStyles.header}>
        <button onClick={() => navigate(-1)}
            className={signupStyles.backButton}>
                <ArrowLeft className="w-5 h-5"/>
        </button>
    <div className={signupStyles.avatar}>
        <User className="w-10 h-10 text-white"/>
    </div>
    <h1 className={signupStyles.headerTitle}>Create Account</h1>
    <p className={signupStyles.headerSubtitle}>
        Join ExpenseTracker and manage your money
    </p>
    </div>
    <div className={signupStyles.formContainer}>
        {errors.api && <p className={signupStyles.apiError}>{errors.api}</p>}
        <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
                <label htmlFor="name" className={signupStyles.label}>
                    Full Name
                </label>
                <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                    <User className="w-5 h-5"/>
                </div>
                <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${signupStyles.input} ${
                    errors.name ? "border-red-300" :" border-gray-200 "
                }`} placeholder=" UserName "
                />
                </div>
                {errors.name && (
                    <p className={signupStyles.fieldError}>{errors.name}</p>
                )}
            </div>

            <div className="mb-6">
                <label htmlFor="email" className={signupStyles.label}>
                    Email Address
                </label>
                <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                    <Mail className="w-5 h-5"/>
                </div>
                <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${signupStyles.input} ${
                    errors.email ? "border-red-300" :" border-gray-200 "
                }`} placeholder=" your@example.com "
                />
                </div>
                {errors.email && (
                    <p className={signupStyles.fieldError}>{errors.email}</p>
                )}
            </div>

            <div className="mb-6">
                <label htmlFor="password" className={signupStyles.label}>
                    Password
                </label>
                <div className={signupStyles.inputContainer}>
                <div className={signupStyles.inputIcon}>
                    <Lock className="w-5 h-5"/>
                </div>
                <input
                type={showPassword ? "text" : "password" }
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${signupStyles.input} ${
                    errors.password ? "border-red-300" :" border-gray-200 "
                }`} placeholder="•••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                className={signupStyles.passwordToggle}>
                {showPassword ? (
                    <EyeOff className="w-5 h-5"/>
                ) : (
                        <Eye className="w-5 h-5" />
                )}
                </button>
                </div>
                {errors.password && (
                    <p className={signupStyles.fieldError}>{errors.password}</p>
                )}
            </div>
            <div className={signupStyles.checkboxContainer}>
            <input
                type="checkbox"
                id="remember"
                value={rememberMe}
                onChange={(e) => setRememberMe(e.target.value)}
                className={`${signupStyles.checkbox} ${
                    errors.email ? "border-red-300" :" border-gray-200 "
                }`} placeholder=" your@example.com "
                />
                <label htmlFor="remember" className={signupStyles.checkboxLabel}> Remember Me
                </label>
            </div>
            <button
            type="submit"
            className={`${signupStyles.button} ${
                isLoading ? signupStyles.buttonDisabled : ""
            }`} disabled={isLoading}>
                {isLoading? (
                      <>
                  <svg className={signupStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
</svg>
                  Creating account...
                </>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>
        <div className={signupStyles.signInContainer}>
          <p className={signupStyles.signInText}>
            Already have an account? {""}
            <Link to="/login" className={signupStyles.signInLink}>
            Sign in</Link>
          </p>
        </div>
    </div>
    </div>
    </div>
  )
}

export default Signup