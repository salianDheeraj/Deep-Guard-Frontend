"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoginAnimation } from "@/hooks/useLoginAnimation";
import ForgotPasswordModal from "./ForgetPasswordModal"; // Added import

interface FormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 pr-20 transition duration-150 ease-in-out placeholder-gray-400 text-gray-800 font-semibold"
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-3 flex items-center p-2 text-gray-500 hover:text-gray-700 z-10"
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
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Added state

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
        console.log("🔁 Access token auto-refreshed");
      } catch (err) {
        console.error("❌ Auto-refresh failed:", err);
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /* Load Google Sign-In SDK */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* Google Login Handler */
  useEffect(() => {
    const handleGoogleSuccess = async (event: any) => {
      const { detail } = event;
      console.log("🔐 Google credential received");

      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(`${API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentials: detail.credential }),
          credentials: "include",
        });

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json()
          : { message: await response.text() };

        if (!response.ok) {
          throw new Error(data.message || "Google auth failed");
        }

        console.log("✅ Google auth successful");
        router.push("/dashboard");
      } catch (err: any) {
        console.error("❌ Google error:", err.message || err);
        setError(err.message || "Google login failed");
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener("googleSuccess", handleGoogleSuccess);
    return () => window.removeEventListener("googleSuccess", handleGoogleSuccess);
  }, [router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!isSigningIn && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!isSigningIn && formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endpoint = isSigningIn ? "/auth/login" : "/auth/signup";
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const payload = {
        email: (formData.email || "").trim(),
        password: formData.password,
        name: formData.name || (formData.email ? formData.email.split("@")[0] : ""),
      };

      console.log(`📤 Auth request -> ${API_URL}${endpoint}`);

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

      console.log("✅ Auth successful (cookie set)");
      setFormData((f) => ({ ...f, password: "", confirmPassword: "" }));

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
      rememberMe: false,
    });
  };

  return (
    <div ref={scope} className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <header className="flex flex-col items-center justify-center text-center mb-10 login-title-group">
        <div className="login-logo flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-md mb-5">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Deepfake Detector</h1>

        <p className="text-lg text-gray-500 max-w-md">
          {isSigningIn ? "Sign in to detect deepfakes and review past analyses" : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      <div className="w-full max-w-sm bg-white p-8 shadow-2xl rounded-3xl border border-gray-100 login-card">
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
            <AuthInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword || ""}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              InputIcon={Lock}
            />
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
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              {/* Added Forgot Password button */}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-150"
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="login-button w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-out transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="h-5 w-5 text-white opacity-90" />
            {isLoading ? "Processing..." : isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* GOOGLE LOGIN SECTION */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* GOOGLE ONE TAP BUTTON */}
          <div
            id="g_id_onload"
            data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
            data-callback="handleCredentialResponse"
            data-auto_prompt="false"
          ></div>

          <div
            id="g_id_signin"
            className="flex justify-center mt-5"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="signin_with"
            data-logo_alignment="left"
            data-shape="rectangular"
            data-width="100%"
          ></div>

          {/* Handle Google Credential Token */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.handleCredentialResponse = (response) => {
                  const event = new CustomEvent('googleSuccess', { detail: response });
                  window.dispatchEvent(event);
                };
              `,
            }}
          />

          {/* Google redirect button (backup) */}
          <button
            onClick={() => {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
              window.location.href = API_URL + "/auth/google";
            }}
            className="w-full mt-4 flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-gray-700 font-medium shadow-sm"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toggleAuthMode();
            }}
            className="ml-1 font-medium text-blue-600 hover:text-blue-700 transition duration-150"
          >
            {isSigningIn ? "Sign up" : "Sign In"}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
