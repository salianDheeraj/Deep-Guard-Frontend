"use client";

import React, {
  useState,
  FC,
  FormEvent,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";
import ForgotPasswordModal from "./ForgetPasswordModal";
import { apiFetch } from "@/lib/api";

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
  const finalType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4 login-form-element">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          type={finalType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 pr-20 transition placeholder-gray-400 text-gray-800 font-semibold"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [otpStatus, setOtpStatus] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
      setOtpTimer((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") {
      setOtpSent(false);
      setOtpTimer(0);
      setOtpStatus(null);
      setFormData((f) => ({ ...f, otp: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateSignin = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateForm = () =>
    isSigningIn ? validateSignin() : validateSignup();

  const handleSendOtp = async () => {
    setError(null);
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOtpSent(true);
      setOtpStatus("OTP sent! Check your email.");
      setOtpTimer(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!isSigningIn) {
      if (!otpSent) return setError("Please request an OTP first");
      if (!formData.otp) return setError("OTP required");
    }

    try {
      setIsLoading(true);

      const endpoint = isSigningIn ? "/auth/login" : "/auth/signup";

      const payload: any = {
        email: formData.email.trim(),
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSigningIn((x) => !x);
    setError(null);
    setOtpSent(false);
    setOtpStatus(null);
    setOtpTimer(0);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      rememberMe: false,
    });
  };

  return (
    <div
      ref={scope}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
    >
      <header className="text-center mb-10 login-title-group">
        <div className="login-logo flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full shadow mb-5 mx-auto">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Deepfake Detector
        </h1>

        <p className="text-lg text-gray-500 max-w-md">
          {isSigningIn
            ? "Sign in to detect deepfakes and view past analyses"
            : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      <div className="w-full max-w-sm bg-white p-8 shadow-xl rounded-3xl border border-gray-100 login-card">
        <form onSubmit={handleSubmit}>
          {!isSigningIn && (
            <AuthInput
              label="Name"
              type="text"
              name="name"
              value={formData.name || ""}
              placeholder="Enter your full name"
              onChange={handleInputChange}
            />
          )}

          <AuthInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleInputChange}
            InputIcon={Mail}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleInputChange}
            InputIcon={Lock}
          />

          {!isSigningIn && (
            <>
              <AuthInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ""}
                placeholder="Re-enter your password"
                onChange={handleInputChange}
                InputIcon={Lock}
              />

              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <button
                  type="button"
                  disabled={isSendingOtp || otpTimer > 0}
                  onClick={handleSendOtp}
                  className="px-4 py-2 rounded-xl border bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 disabled:opacity-50"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : otpSent
                    ? "Resend OTP"
                    : "Send OTP"}
                </button>

                {otpTimer > 0 && (
                  <span className="text-sm text-gray-500">
                    Resend in {otpTimer}s
                  </span>
                )}
              </div>

              {otpStatus && (
                <div className="mb-3 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm">
                  {otpStatus}
                </div>
              )}

              {otpSent && (
                <AuthInput
                  label="OTP Code"
                  type="text"
                  name="otp"
                  value={formData.otp || ""}
                  placeholder="Enter 6-digit code"
                  onChange={handleInputChange}
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
                  className="h-4 w-4"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button w-full py-3 px-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:scale-[1.01] active:scale-[0.97] transition disabled:opacity-50"
          >
            {isLoading ? "Processing..." : isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleAuthMode();
            }}
            className="ml-1 font-medium text-blue-600 hover:text-blue-700"
          >
            {isSigningIn ? "Sign Up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
