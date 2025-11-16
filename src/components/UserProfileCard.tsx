"use client";

import React, { useState, useEffect } from "react";
import { User, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link"; // Import the Next.js Link component

interface UserProfile {
  name: string;
  email: string;
  profile_pic: string; // This key must match what your backend sends
}

export default function UserProfileCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token found");
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error("API URL is not configured");
        }
        
       const res = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to load profile");
        }

        const data = await res.json();
        setProfile(data);

      } catch (err: any) {
        console.error("Profile Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔵 1. LOADING STATE
  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    );
  }

  // 🔴 2. ERROR STATE
  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div className="ml-2">
            <p className="text-sm text-red-700">
              {error || "Could not load profile."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 3. SUCCESS STATE
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center">
        {profile.profile_pic ? (
          <img
            src={profile.profile_pic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
            {profile.name
              ? profile.name.charAt(0).toUpperCase()
              : <User size={20} />}
          </div>
        )}

        <div className="ml-3 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {profile.name || "User"}
          </h3>
          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
        </div>
      </div>

      <Link
        href="/dashboard/account"
        className="text-xs font-medium text-blue-600 hover:underline mt-2 block"
      >
        View Account
      </Link>
    </div>
  );
}