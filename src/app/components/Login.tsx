"use client";

import React, { useState, FC } from "react";
import { Shield, Mail, Lock, Key } from "lucide-react";

// Type for input props (for clean typing)
interface AuthInputProps {
  label: string;
  type: string;
  placeholder: string;
  InputIcon?: FC<React.SVGProps<SVGSVGElement>>;
}

// Reusable Input Field Component
const AuthInput: FC<AuthInputProps> = ({
  label,
  type,
  placeholder,
  InputIcon = Shield,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 pr-10 transition duration-150 ease-in-out placeholder-gray-800 text-gray-800 font-semibold"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <InputIcon className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  </div>
);

// Main AuthForm Component
const AuthForm: FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [isDevPassVisible, setIsDevPassVisible] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      {/* Header */}
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

      {/* Form */}
      <div className="w-full max-w-sm bg-white p-8 shadow-2xl rounded-3xl border border-gray-100">
        <form>
          {isSigningIn && isDevPassVisible && (
            <div className="mb-6 border-b border-dashed pb-4">
              <AuthInput
                label="Developer Passkey (DEV)"
                type="password"
                placeholder="Enter master key"
                InputIcon={Key}
              />
            </div>
          )}

          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            InputIcon={Mail}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            InputIcon={Lock}
          />

          {!isSigningIn && (
            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              InputIcon={Lock}
            />
          )}

          {isSigningIn && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
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

          <button
            type="button"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white 
                       bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSigningIn ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSigningIn ? "Don't have an account?" : "Already have an account?"}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsSigningIn(!isSigningIn);
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

export default AuthForm;
