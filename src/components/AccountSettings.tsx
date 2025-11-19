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
  const mainContentRef = useRef<HTMLElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // =========================================================
  // 🔥 FETCH USER PROFILE WITH COOKIE AUTH
  // =========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // 🔥 HttpOnly cookie auth
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile({
          name: data.name,
          email: data.email,
          profile_pic: data.profile_pic || "",
        });

      } catch (err) {
        console.error("❌ Profile fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // =========================================================
  // 🔥 GSAP Animations
  // =========================================================
  const hasAnimated = useRef(false);

  useLayoutEffect(() => {
    if (!loading && mainContentRef.current && !hasAnimated.current) {
      hasAnimated.current = true;

      const container = mainContentRef.current;

      gsap.set(container, { perspective: 1000 });

      const allSections = gsap.utils.toArray<HTMLElement>(container.children);
      const header = allSections[0];
      const contentSections = allSections.slice(1);

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });

      tl.from(header, { y: -30, opacity: 0, duration: 0.6 });

      tl.from(
        contentSections,
        {
          opacity: 0,
          y: 50,
          rotateX: -90,
          transformOrigin: "bottom center",
          clipPath: "polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)",
          stagger: 0.15,
        },
        "-=0.3"
      ).to(
        contentSections,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.2,
          ease: "power2.out",
        },
        "-=0.8"
      );

      return () => {
        gsap.killTweensOf(container);
        gsap.killTweensOf(header);
        gsap.killTweensOf(contentSections);
      };
    }
  }, [loading]);

  // =========================================================
  // Profile updated from child component
  // =========================================================
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // =========================================================
  // Loading UI
  // =========================================================
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

  // =========================================================
  // UI
  // =========================================================
  return (
    <main
      ref={mainContentRef}
      className="flex-1 p-6 flex flex-col h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your profile and preferences</p>
      </div>

      {/* Sections */}
      <AccountProfile profile={profile} onProfileUpdate={handleProfileUpdate} />
      <AccountPassword />
      <AccountDataManagement />
    </main>
  );
}
