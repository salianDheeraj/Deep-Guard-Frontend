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
import Link from 'next/link';

interface FormData {
  email: string;
  password: string;
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateSignin = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateSignin()) return;

    setIsLoading(true);

    try {
      const endpoint = "/auth/login";
      const trimmedEmail = (formData.email || "").trim();
      const payload = {
        email: trimmedEmail,
        password: formData.password,
        rememberMe: formData.rememberMe,
      };

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

      debug("✅ Login successful");
      setFormData((f) => ({ ...f, password: "" }));
      router.push("/dashboard");
    } catch (err: any) {
      // console.error("❌ Error:", err.message || err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={scope} className={styles.container}>
      <div className={styles.themeToggle}>
        <ThemeToggleButton />
      </div>

      <header className={`${styles.header} login-title-group`}>
        <div className={`${styles.logo} login-logo`}>
          <Shield className={styles.logoIcon} />
        </div>

        <h1 className={styles.title}>Deepfake Detector</h1>

        <p className={styles.subtitle}>
          Sign in to detect deepfakes and review past analyses
        </p>
      </header>

      <div className={`${styles.card} login-card`}>
        <form onSubmit={handleSubmit}>
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

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className={styles.forgotPassword}
            >
              Forgot Password?
            </button>

            <ForgotPasswordModal
              isOpen={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
            />
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} login-button`}
          >
            <Shield className={styles.submitIcon} />
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{" "}
          <Link href="/signup" className={styles.footerLink}>
            Sign up
          </Link>
        </p>

        {/* TRIAL BUTTON */}
        <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem" }}>
          <button
            type="button"
            onClick={async () => {
              try {
                setIsLoading(true);
                const res = await apiFetch("/api/trial/join", {
                  method: "POST",
                });

                if (res.ok) {
                  debug("✅ Trial started");
                  router.push("/dashboard");
                } else {
                  const err = await res.json();
                  setError(err.message || "Trial join failed");
                }
              } catch (e: any) {
                setError("Failed to join trial");
              } finally {
                setIsLoading(false);
              }
            }}
            className={styles.submitButton}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginTop: "0.5rem"
            }}
          >
            Try without an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
