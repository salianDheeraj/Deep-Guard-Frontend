"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useEffect } from "react";
import { X, RotateCcw, Shield } from "lucide-react";
import ReactDOM from "react-dom";
import styles from "@/styles/ForgetPassword.module.css";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [otpTimer, setOtpTimer] = useState(120);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🚨 CRITICAL FIX: Use empty string to leverage Next.js Rewrite Proxy
  const API_URL = ""; 

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step !== "otp") return;
    if (otpTimer <= 0) return;

    const t = setInterval(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer, step]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setStep("email");
    setCooldown(0);
    setOtpTimer(120);
    setFormData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIX: Use relative path (empty API_URL)
      const response = await fetch(`${API_URL}/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setCooldown(60);
      setOtpTimer(120);
      setSuccessMessage("OTP sent to your email!");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      !formData.otp ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIX: Use relative path (empty API_URL)
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setSuccessMessage("Password reset successfully!");
      setStep("success");

      setTimeout(() => handleClose(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      // ✅ FIX: Use relative path (empty API_URL)
      const response = await fetch(`${API_URL}/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setCooldown(60);
      setOtpTimer(120);
      setSuccessMessage("OTP resent successfully");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !isClient) return null;

  const modalContent = (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          onClick={handleClose}
          className={styles.closeButton}
        >
          <X className="h-6 w-6" />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            {/* UPDATED: Switched to Shield Logo. Solid Blue (Light) / Cyan (Dark) */}
            <Shield className={`${styles.icon} !text-blue-600 dark:!text-cyan-400`} />
          </div>
          
          {/* TITLE: Gradient Blue+Pink (Light) / Cyan+Purple (Dark) */}
          <h2 className={`${styles.title} !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-600 !to-pink-500 dark:!from-cyan-400 dark:!to-purple-500 transition-all duration-300`}>
            Reset Password
          </h2>
          
          <p className={styles.subtext}>
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the OTP and set a new password"}
            {step === "success" && "Password reset successful!"}
          </p>
        </div>

        {/* STEP 1 */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={styles.input}
            />

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>

              {/* MAIN BUTTON: Gradient Blue+Pink (Light) / Cyan+Purple (Dark) */}
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.submitButton} !border-0 !text-white !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 transition-all duration-300`}
              >
                {isLoading ? "Sending..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2 */}
        {step === "otp" && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <input
              type="text"
              name="otp"
              maxLength={6}
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter 6-digit OTP"
              className={`${styles.input} ${styles.otpInput}`}
            />

            <p className={styles.resendText}>
              Resend OTP:{" "}
              <span className={styles.timer}>
                {Math.floor(otpTimer / 60)}:
                {(otpTimer % 60).toString().padStart(2, "0")}
              </span>
            </p>

            {/* RESEND BUTTON: Text Blue (Light) / Cyan (Dark) */}
            <button
              type="button"
              onClick={resendOtp}
              disabled={cooldown > 0}
              className={`${styles.resendButton} !text-blue-600 dark:!text-cyan-400 hover:!underline transition-colors duration-300`}
            >
              <RotateCcw className="h-4 w-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>

            {/* PASSWORD FIELDS */}
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New password"
              disabled={formData.otp.length !== 6}
              className={styles.input}
            />

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              disabled={formData.otp.length !== 6}
              className={styles.input}
            />

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>

              {/* MAIN BUTTON: Gradient Blue+Pink (Light) / Cyan+Purple (Dark) */}
              <button
                type="submit"
                disabled={isLoading}
                className={`${styles.submitButton} !border-0 !text-white !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 transition-all duration-300`}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === "success" && (
          <div className="text-center py-4">
            <p className={styles.successMessage}>{successMessage}</p>

            {/* CLOSE BUTTON: Gradient Blue+Pink (Light) / Cyan+Purple (Dark) */}
            <button
              onClick={handleClose}
              className={`${styles.closeSuccessButton} !border-0 !text-white !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 transition-all duration-300`}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ForgotPasswordModal;