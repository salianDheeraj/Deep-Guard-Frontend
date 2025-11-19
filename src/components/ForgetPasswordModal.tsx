"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useEffect } from "react";
import { Shield, Mail, X, KeyRound, RotateCcw } from "lucide-react";
import ReactDOM from "react-dom";

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

  const [cooldown, setCooldown] = useState(0); // seconds before OTP resend allowed
  const [otpTimer, setOtpTimer] = useState(120); // 2-minute countdown

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => setIsClient(true), []);

  /* Countdown for resend cooldown */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  /* OTP expiry countdown timer */
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

  /* SEND OTP (Step 1) */
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
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(`${API_URL}/auth/send-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setCooldown(60); // 60 sec cooldown
      setOtpTimer(120); // 2 minutes
      setSuccessMessage("OTP sent to your email!");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* RESET PASSWORD (Step 2) */
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
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  /* REQUEST NEW OTP (cooldown enforced) */
  const resendOtp = async () => {
    if (cooldown > 0) return;

    setIsLoading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  /* MAIN MODAL */
  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 shadow mx-auto mb-3">
            <KeyRound className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the OTP and set a new password"}
            {step === "success" && "Password reset successful!"}
          </p>
        </div>

        {/* STEP 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
              required
            />

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP PAGE */}
        {step === "otp" && (
          <form onSubmit={handleResetPassword} className="space-y-3">
            {/* OTP FIELD */}
            <input
              type="text"
              name="otp"
              maxLength={6}
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter 6-digit OTP"
className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg text-center tracking-widest"

              required
            />

            {/* TIMER */}
            <p className="text-sm text-gray-600 text-center">
              Resend Otp :{" "}
              <span className="font-semibold text-red-600">
                {Math.floor(otpTimer / 60)}:
                {(otpTimer % 60).toString().padStart(2, "0")}
              </span>
            </p>

            {/* RESEND */}
            <button
              type="button"
              onClick={resendOtp}
              disabled={cooldown > 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>

            {/* PASSWORDS */}
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New password"
             className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg"

              required
            />

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
            className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg"

              required
            />

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between items-center mt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === "success" && (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">{successMessage}</p>

            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
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
