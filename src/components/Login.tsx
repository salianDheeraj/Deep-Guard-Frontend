"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";
import { debug } from '@/lib/logger';
import ForgotPasswordModal from "./ForgetPasswordModal";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/Login.module.css";

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
    <div className={`${styles.inputGroup} login-form-element`}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.inputField}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className={styles.passwordToggle}
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

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

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

      const res = await apiFetch("/auth/signup/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (formData.email || "").trim(),
          name: formData.name,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { message: await res.text() };
      if (!res.ok) {
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
      const payload: any = {
        email: trimmedEmail,
        password: formData.password,
      };

      if (!isSigningIn) {
        payload.otp = formData.otp?.trim();
        payload.name = formData.name || formData.email.split("@")[0];
      }

      if (isSigningIn) {
        payload.rememberMe = formData.rememberMe;
      }

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { message: await res.text() };

      if (!res.ok) {
        throw new Error(data?.message || `Auth failed (${res.status})`);
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
    // 2. Added relative positioning for button and dark mode background
    <div ref={scope} className={styles.container}>

      {/* 3. Added Theme Toggle Button */}
      <div className={styles.themeToggle}>
        <ThemeToggleButton />
      </div>

      <header className={`${styles.header} login-title-group`}>
        <div className={`${styles.logo} login-logo`}>
          <Shield className={styles.logoIcon} />
        </div>

        <h1 className={styles.title}>Deepfake Detector</h1>

        <p className={styles.subtitle}>
          {isSigningIn ? "Sign in to detect deepfakes and review past analyses" : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      <div className={`${styles.card} login-card`}>
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

              <div className={styles.otpContainer}>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || otpTimer > 0}
                  className={styles.otpButton}
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpSent
                      ? "Resend OTP"
                      : "Send OTP"}
                </button>
                {otpTimer > 0 && (
                  <span className={styles.otpTimer}>Resend available in {otpTimer}s</span>
                )}
              </div>

              {otpStatus && (
                <div className={styles.otpStatus}>
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
            <div className={styles.authOptions}>
              <div className={styles.rememberMeWrapper}>
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe || false}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="remember-me" className={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              {/* Added Forgot Password button */}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className={styles.forgotPassword}
              >
                Forgot Password?
              </button>
              {/* Forgot Password Modal */}
              <ForgotPasswordModal
                isOpen={showForgotPassword}
                onClose={() => setShowForgotPassword(false)}
              />
            </div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} login-button`}
          >
            <Shield className={styles.submitIcon} />
            {isLoading ? "Processing..." : isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Google authentication removed */}

        <p className={styles.footerText}>
          {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleAuthMode();
            }}
            className={styles.footerLink}
          >
            {isSigningIn ? "Sign up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;