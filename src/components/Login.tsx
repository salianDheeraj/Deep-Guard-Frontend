"use client";

import React, { useState, FC, FormEvent, ChangeEvent } from "react";
import { Shield, Mail, Lock, Key } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  devPasskey?: string;
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
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 pr-10 transition duration-150 ease-in-out placeholder-gray-400 text-gray-800 font-semibold"
        required
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <InputIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

const Login: FC = () => {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isDevPassVisible, setIsDevPassVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    devPasskey: "",
    rememberMe: false,
  });

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
      // ✅ CHANGE: /api/auth → /auth
      const endpoint = isSigningIn ? '/auth/login' : '/auth/signup';
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log('📤 Sending to:', `${API_URL}${endpoint}`);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.email.split('@')[0],
          ...(isDevPassVisible && { devPasskey: formData.devPasskey }),
          ...(isSigningIn && { rememberMe: formData.rememberMe }),
        }),
      });
      console.log('📥 Response status:', response.body);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ Auth successful');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Error:', err.message);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSigningIn(!isSigningIn);
    setError(null);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      devPasskey: "",
      rememberMe: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <header className="flex flex-col items-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="p-3 mb-4 bg-indigo-100 rounded-full shadow-xl">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>

          {isSigningIn && (
            <button
              onClick={() => setIsDevPassVisible(!isDevPassVisible)}
              className={`p-2 mb-4 rounded-full transition duration-300 ${
                isDevPassVisible
                  ? "bg-indigo-300 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              title={isDevPassVisible ? "Hide Dev Pass" : "Show Dev Pass"}
              type="button"
            >
              <Key className="h-5 w-5" />
            </button>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Deepfake Detector
        </h1>
        <p className="mt-2 text-md text-gray-500 max-w-sm text-center">
          {isSigningIn
            ? "Sign in to detect deepfakes and review past analyses"
            : "Create your account to start detecting deepfakes"}
        </p>
      </header>

      <div className="w-full max-w-sm bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
        <form onSubmit={handleSubmit}>
          {isSigningIn && isDevPassVisible && (
            <div className="mb-6 border-b border-dashed pb-4">
              <AuthInput
                label="Developer Passkey (DEV)"
                type="password"
                name="devPasskey"
                value={formData.devPasskey || ""}
                onChange={handleInputChange}
                placeholder="Enter master key"
                InputIcon={Key}
              />
            </div>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white 
                       bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]
                       disabled:opacity-50 disabled:cursor-not-allowed"
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
