"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";
import { debug } from '@/lib/logger';
import ForgotPasswordModal from "./ForgetPasswordModal";
import ThemeToggleButton from "@/components/ThemeToggleButton";

interface FormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
  rememberMe?: boolean;
}

interface AuthInputProps {
  label: string;
  type: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  InputIcon?: FC<React.SVGProps<SVGSVGElement>>;
}

const AuthInput: FC<AuthInputProps> = ({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  InputIcon = Shield,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4 login-form-element">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          // Blue focus in Light, Teal focus in Dark
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-blue-500 dark:focus:ring-teal-500 focus:border-blue-500 dark:focus:border-teal-500 pr-20 transition duration-150 ease-in-out placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-white bg-white dark:bg-gray-700 font-semibold"
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-3 flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

const Login: FC = () => {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  useLoginAnimation(scope);

  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    rememberMe: false,
  });

  /* Auto refresh access token every 14 minutes */
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const interval = setInterval(async () => {
      try {
        await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        debug("🔁 Access token auto-refreshed");
      } catch (err) {
        console.error("❌ Auto-refresh failed:", err);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      setOtpSent(false);
      setOtpTimer(0);
      setOtpStatus(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "email" ? { otp: "" } : {}),
    }));
  };

  const validateSignin = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    return true;
  };

  const validateSignup = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if ((formData.password || "").length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const validateForm = () => (isSigningIn ? validateSignin() : validateSignup());

  const handleSendOtp = async () => {
    setError(null);
    setOtpStatus(null);

    if (!validateSignup()) return;

    try {
      setIsSendingOtp(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/auth/signup/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (formData.email || "").trim(),
          name: formData.name,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };
      if (!response.ok) {
        throw new Error(data?.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setOtpStatus("OTP sent! Please check your email.");
      setOtpTimer(60);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!isSigningIn) {
      if (!otpSent) {
        setError("Please request an OTP before signing up");
        return;
      }

      if (!formData.otp) {
        setError("Please enter the OTP sent to your email");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isSigningIn ? "/auth/login" : "/auth/signup";
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const trimmedEmail = (formData.email || "").trim();
      const payload = {
        email: trimmedEmail,
        password: formData.password,
        name: formData.name || (formData.email ? formData.email.split("@")[0] : ""),
        ...(isSigningIn ? {} : { otp: (formData.otp || "").trim() }),
      };

      debug(`📤 Auth request -> ${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const ct = response.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await response.json() : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data?.message || `Auth failed (${response.status})`);
      }

      debug("✅ Auth successful (cookie set)");
      setFormData((f) => ({
        ...f,
        password: "",
        confirmPassword: "",
        otp: "",
      }));
      if (!isSigningIn) {
        setOtpSent(false);
        setOtpTimer(0);
        setOtpStatus(null);
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Error:", err.message || err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSigningIn(!isSigningIn);
    setError(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      rememberMe: false,
    });
    setOtpSent(false);
    setOtpTimer(0);
    setOtpStatus(null);
  };

  return (
    <div ref={scope} className="relative min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">

      <div className="absolute top-5 right-5 z-50">
        <ThemeToggleButton />
      </div>

      <header className="flex flex-col items-center justify-center text-center mb-10 login-title-group">
        <div className="login-logo flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-teal-900 dark:to-teal-950 shadow-md mb-5 transition-colors">
          <Shield className="h-10 w-10 text-blue-600 dark:text-teal-400" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Deepfake Detector</h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md">
          {isSigningIn ? "Sign in to detect deepfakes and review past analyses" : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 login-card transition-colors duration-300">
        <form onSubmit={handleSubmit}>
          {!isSigningIn && (
            <AuthInput
              label="Name"
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              InputIcon={Shield}
            />
          )}

          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            InputIcon={Mail}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            InputIcon={Lock}
          />

          {!isSigningIn && (
            <>
              <AuthInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                InputIcon={Lock}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || otpTimer > 0}
                  className="px-4 py-2 rounded-xl border font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition
                             border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100
                             dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
                </button>
                {otpTimer > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Resend available in {otpTimer}s</span>
                )}
              </div>

              {otpStatus && (
                <div className="mb-4 p-3 rounded-lg text-sm
                                bg-blue-50 border border-blue-200 text-blue-700
                                dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-300">
                  {otpStatus}
                </div>
              )}

              {otpSent && (
                <AuthInput
                  label="OTP Code"
                  type="text"
                  name="otp"
                  value={formData.otp || ""}
                  onChange={handleInputChange}
                  placeholder="Enter the 6-digit code"
                  InputIcon={Mail}
                />
              )}
            </>
          )}

          {isSigningIn && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe || false}
                  onChange={handleInputChange}
                  // CHANGED: Added accent-color for guaranteed Teal in Dark Mode
                  className="h-4 w-4 border-gray-300 rounded cursor-pointer
                             text-blue-600 focus:ring-blue-500
                             dark:bg-gray-700 dark:border-gray-600 dark:text-teal-600 dark:focus:ring-teal-500
                             accent-blue-600 dark:accent-teal-600"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium transition duration-150
                           text-blue-600 hover:text-blue-700
                           dark:text-teal-400 dark:hover:text-teal-300"
              >
                Forgot Password?
              </button>
              
              <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-out transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                       bg-blue-600 hover:bg-blue-700 focus:ring-blue-500
                       dark:bg-teal-600 dark:hover:bg-teal-700 dark:focus:ring-teal-500"
          >
            <Shield className="h-5 w-5 text-white opacity-90" />
            {isLoading ? "Processing..." : isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleAuthMode();
            }}
            className="ml-1 font-medium transition duration-150
                       text-blue-600 hover:text-blue-700
                       dark:text-teal-400 dark:hover:text-teal-300"
          >
            {isSigningIn ? "Sign up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;