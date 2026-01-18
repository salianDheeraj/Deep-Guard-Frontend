"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { Shield, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";
import { debug } from '@/lib/logger';
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/Login.module.css";
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
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
    // Spacing: mb-4
    <div className={`${styles.inputGroup} login-form-element mb-4`}>
      <label className={`${styles.label} mb-2 block`}>{label}</label>
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

const Signup: FC = () => {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  useLoginAnimation(scope);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  });

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "email") {
      setOtpSent(false);
      setOtpTimer(0);
      setOtpStatus(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "email" ? { otp: "" } : {}),
    }));
  };

  const validateSignup = (): boolean => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

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
          email: formData.email.trim(),
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

    if (!validateSignup()) return;

    if (!otpSent) {
      setError("Please request an OTP before signing up");
      return;
    }

    if (!formData.otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        otp: formData.otp.trim(),
        name: formData.name,
      };

      const res = await apiFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { message: await res.text() };

      if (!res.ok) {
        throw new Error(data?.message || `Signup failed (${res.status})`);
      }

      debug("✅ Signup successful");
      router.push("/dashboard");
    } catch (err: any) {
      // console.error("❌ Error:", err.message || err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Responsive Container: Added px-4 for mobile safe area
    <div ref={scope} className={`${styles.container} px-4 md:px-0`}>
      <div className={styles.themeToggle}>
        <ThemeToggleButton />
      </div>

      {/* HEADER: Adjusted margin for mobile (mb-6) vs desktop (mb-8) */}
      <header className={`${styles.header} login-title-group flex flex-col items-center gap-2`}>

        {/* LOGO: Scaled down on mobile (w-12) vs desktop (w-16) */}
        <div className={`${styles.logo} login-logo`}>
          <Shield className={`${styles.logoIcon} !text-blue-600 dark:!text-cyan-400 w-12 h-12 md:w-16 md:h-16 transition-colors duration-300`} />
        </div>

        {/* TITLE: Adjusted size for mobile (text-2xl) vs desktop (text-3xl) */}
        <h1 className={`${styles.title} !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500 transition-all duration-300 text-2xl md:text-3xl font-bold text-center`}>
          Create Account
        </h1>

        {/* Subtitle: slightly smaller on mobile */}
        <p className={`${styles.subtitle} mt-2 text-sm md:text-base text-center`}>
          Join us to start detecting deepfakes securely
        </p>
      </header>

      {/* CARD: Adjusted padding for mobile (p-6) vs desktop (p-8) */}
      <div className={`${styles.card} login-card w-full max-w-md`}>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <AuthInput
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            InputIcon={User}
          />

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
            placeholder="Choose a password"
            InputIcon={Lock}
          />

          <AuthInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter your password"
            InputIcon={Lock}
          />

          <div className={`${styles.otpContainer} pt-2 pb-2 flex flex-wrap gap-2 items-center`}>
            {/* SEND OTP BUTTON */}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || otpTimer > 0}
              className={`${styles.otpButton} !border !border-blue-600 !text-blue-600 hover:!bg-blue-50 dark:!border-cyan-400 dark:!text-cyan-400 dark:hover:!bg-cyan-900/20 transition-all duration-300 px-4 py-2 rounded-md text-sm md:text-base`}
            >
              {isSendingOtp
                ? "Sending..."
                : otpSent
                  ? "Resend OTP"
                  : "Send OTP"}
            </button>
            {otpTimer > 0 && (
              <span className={`${styles.otpTimer} !text-blue-600 dark:!text-cyan-400 text-sm`}>
                Resend available in {otpTimer}s
              </span>
            )}
          </div>

          {otpStatus && (
            <div className={`${styles.otpStatus} !text-blue-600 dark:!text-cyan-400 text-sm font-medium`}>
              {otpStatus}
            </div>
          )}

          {otpSent && (
            <div className="mt-4">
              <AuthInput
                label="OTP Code"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter the 6-digit code"
                InputIcon={Mail}
              />
            </div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} login-button !border-0 !text-white !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 transition-all duration-300 w-full py-3 mt-4 text-base font-medium`}
          >
            <Shield className={styles.submitIcon} />
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={`${styles.footerText} mt-6 text-center text-sm md:text-base`}>
          Already have an account?{" "}
          <Link href="/login" className={`${styles.footerLink} !text-blue-600 dark:!text-cyan-400 hover:!underline transition-colors duration-300 ml-1`}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;