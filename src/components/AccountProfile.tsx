// src/app/dashboard/components/AccountProfile.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";

interface AccountProfileProps {
  profile: { name: string; email: string; profile_pic: string };
  onProfileUpdate: (profile: {
    name: string;
    email: string;
    profile_pic: string;
  }) => void;
}

export default function AccountProfile({
  profile,
  onProfileUpdate,
}: AccountProfileProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [profilePic, setProfilePic] = useState<string | null>(
    profile.profile_pic || null
  );
  const [saveState, setSaveState] =
    useState<"IDLE" | "SAVING" | "SUCCESS">("IDLE");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProfile(profile);
    setProfilePic(profile.profile_pic || null);
  }, [profile]);

  // =====================================
  // HANDLE PROFILE PICTURE (PREVIEW ONLY)
  // =====================================
  const handleProfilePicChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
      setLocalProfile((prev) => ({
        ...prev,
        profile_pic: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // =====================================
  // SAVE PROFILE USING COOKIE AUTH
  // =====================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("SAVING");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/account`, {
        method: "PUT",
        credentials: "include", // 🔥 Cookie-based Auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localProfile),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      onProfileUpdate(localProfile);
      setSaveState("SUCCESS");
      setTimeout(() => setSaveState("IDLE"), 2000);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to save profile. Please try again.");
      setSaveState("IDLE");
    }
  };

  const handleCancel = () => {
    setLocalProfile(profile);
    setProfilePic(profile.profile_pic || null);
  };

  // =====================================
  // UI
  // =====================================
  return (
    <form onSubmit={handleSave}>
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Profile Information
        </h2>

        {/* Profile Picture */}
        <div className="flex items-center mb-8">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile Preview"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {localProfile.name
                ? localProfile.name.charAt(0).toUpperCase()
                : "U"}
            </div>
          )}

          <div className="ml-4">
            <span className="text-lg font-semibold text-gray-800">
              {localProfile.name || "User"}
            </span>
            <span className="block text-sm text-gray-500">
              {localProfile.email}
            </span>

            <button
              type="button"
              className="text-sm text-blue-600 hover:underline mt-1"
              onClick={handleChangePhotoClick}
            >
              Change Profile Photo
            </button>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleProfilePicChange}
          className="hidden"
          accept="image/png, image/jpeg"
        />

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-900"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700"
              value={localProfile.name}
              onChange={(e) =>
                setLocalProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              disabled
              value={localProfile.email}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 mt-8">
          <button
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${
                saveState === "SUCCESS"
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
              ${
                saveState === "SAVING"
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : ""
              }
            `}
            type="submit"
            disabled={saveState === "SAVING"}
          >
            {saveState === "IDLE" && "Save Changes"}
            {saveState === "SAVING" && "Saving..."}
            {saveState === "SUCCESS" && "Saved!"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
