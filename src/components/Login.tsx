"use client";

import React, { useState, FC, FormEvent, ChangeEvent, useEffect, useRef } from "react";
// ✅ Corrected Import (includes Eye and EyeOff)
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// 🟩 [Animation Import]
import { useLoginAnimation } from "@/hooks/useLoginAnimation";

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

// ✅ Corrected AuthInput Component
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
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

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

        {/* This is the show/hide "Eye" icon BUTTON */}
        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute inset-y-0 right-3 flex items-center p-2 text-gray-500 hover:text-gray-700 z-10"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {/* This is your original Lock icon */}
        
        
      </div>
    </div>
  );
};

const Login: FC = () => {
  const router = useRouter();

  // 🟩 [Animation Setup]
  const scope = useRef<HTMLDivElement>(null);
  useLoginAnimation(scope); // Run animated login form

  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });

  // ✅ LISTEN FOR GOOGLE SUCCESS
  useEffect(() => {
    const handleGoogleSuccess = async (event: any) => {
      const { detail } = event;
      console.log("🔐 Google credential received");

      try {
        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credentials: detail.credential }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Google auth failed");
        }

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("✅ Google auth successful");
        
        router.push("/dashboard");
      } catch (err: any) {
        console.error("❌ Google error:", err.message);
        setError(err.message);
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

      console.log("📤 Sending to:", `${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.email.split("@")[0],
          ...(isSigningIn && { rememberMe: formData.rememberMe }),
        }),
      });

      console.log("📥 Response status:", response.status);

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        const rawText = await response.text();
        console.error("❌ Non-JSON response:", rawText);
        throw new Error(`Server returned HTML or invalid JSON (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("✅ Token saved");
      }

      console.log("✅ Auth successful");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Error:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSigningIn(!isSigningIn);
    setError(null);
    setFormData({
      name: '',
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false,
    });
  };

  return (
    // 🟩 [Animation Scope]
    <div ref={scope} className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* 🟩 [Animation Target] Header */}
      <header className="flex flex-col items-center justify-center text-center mb-10 login-title-group">
        {/* Blue Shield Logo */}
        <div className="login-logo flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-md mb-5">
          <Shield className="h-10 w-10 text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
          Deepfake Detector
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-500 max-w-md">
          {isSigningIn
            ? "Sign in to detect deepfakes and review past analyses"
            : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      {/* 🟩 [Animation Target] Login Card */}
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
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-150"
              >
                Forgot Password?
              </a>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 🟩 [Animation Target] Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="login-button w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white 
                      bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-out transform hover:scale-[1.01] active:scale-[0.98] 
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="h-5 w-5 text-white opacity-90" />
            {isLoading ? "Processing..." : isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* ✅ GOOGLE OAUTH BUTTON */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <div
              id="g_id_onload"
              data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
              data-callback="handleCredentialResponse"
            />
            <div
              id="g_id_signin"
              data-type="standard"
              data-size="large"
              data-theme="outline"
              data-text="signin_with"
              data-shape="rectangular"
              data-logo_alignment="left"
            />
          </div>

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

      {/* ✅ LOAD GOOGLE SCRIPT */}
      <script src="https://accounts.google.com/gsi/client" async defer />
    </div>
  );
};

export default Login;