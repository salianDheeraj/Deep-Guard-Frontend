"use client";

import React, { useState, useEffect } from "react";
import { User, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  profile_pic: string;
}

export default function UserProfileCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // FIXED: correct route
        const res = await fetch(`${API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401) {
          throw new Error("Not authenticated");
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        console.error("❌ Profile Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[100px] transition-colors">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="ml-2">
            <p className="text-sm text-red-700 dark:text-red-300">
              {error || "Could not load user profile."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 transition-colors">
      <div className="flex items-center">
        {profile.profile_pic ? (
          <img
            src={profile.profile_pic}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
            {profile.name ? profile.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
        )}

        <div className="ml-3 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {profile.name || "User"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {profile.email}
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/account"
        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2 block"
      >
        View Account
      </Link>
    </div>
  );
}
