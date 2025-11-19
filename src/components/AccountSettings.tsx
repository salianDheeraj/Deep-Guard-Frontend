"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import AccountProfile from "../components/AccountProfile";
import AccountPassword from "../components/AccountPassword";
import AccountDataManagement from "../components/AccountDataManagement";
import { gsap } from "gsap";

interface UserProfile {
  name: string;
  email: string;
  profile_pic: string;
}

export default function AccountSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    profile_pic: "",
  });
  const [loading, setLoading] = useState(true);

  // Ref for animation container
  const mainContentRef = useRef<HTMLElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/account", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("❌ Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // GSAP Animation on load
  const hasAnimated = useRef(false);
  useLayoutEffect(() => {
    if (!loading && mainContentRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      const container = mainContentRef.current;
      const items = container.children;

      // 1. Set initial state (Hidden, slightly smaller, pushed down)
      gsap.set(items, { 
        opacity: 0, 
        y: 40, 
        scale: 0.95 
      });

      // 2. Animate to final state with a "Back" ease (subtle bounce)
      gsap.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,         // 0.15s delay between each card
        ease: "back.out(1.2)", // The "1.2" controls the amount of overshoot/bounce
        clearProps: "all"
      });

      return () => {
        gsap.killTweensOf(items);
      };
    }
  }, [loading]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={mainContentRef}
      className="flex-1 p-6 flex flex-col h-full overflow-y-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col mb-6 origin-left">
        <h1 className="text-3xl font-bold text-gray-800">
          Account Settings
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your profile and preferences
        </p>
      </div>

      {/* Subsections */}
      <AccountProfile
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
      <AccountPassword />
      <AccountDataManagement />
    </main>
  );
}