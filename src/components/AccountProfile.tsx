// src/app/dashboard/components/AccountProfile.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AccountProfileProps {
  profile: { name: string; email: string; profile_pic: string };
  onProfileUpdate: (profile: {
    name: string;
    email: string;
    profile_pic: string;
  }) => void;
}

type SaveState = "IDLE" | "SAVING" | "SUCCESS";

export default function AccountProfile({
  profile,
  onProfileUpdate,
}: AccountProfileProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [profilePic, setProfilePic] = useState<string | null>(
    profile.profile_pic || null,
  );
  const [profileSaveState, setProfileSaveState] = useState<SaveState>("IDLE");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("IDLE");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProfile(profile);
    setProfilePic(profile.profile_pic || null);
  }, [profile]);

  const handleProfilePicChange = (
    event: React.ChangeEvent<HTMLInputElement>,
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveState("SAVING");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/account/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: localProfile.name,
          profile_pic: localProfile.profile_pic,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to save profile");
      }

      const data = await res.json();
      const updatedProfile = {
        name: data.user.name,
        email: localProfile.email,
        profile_pic: data.user.profile_pic,
      };

      onProfileUpdate(updatedProfile);
      setProfileSaveState("SUCCESS");
      setTimeout(() => setProfileSaveState("IDLE"), 2000);
    } catch (error: any) {
      console.error("Profile update failed:", error);
      alert(error.message || "Failed to save profile. Please try again.");
      setProfileSaveState("IDLE");
    }
  };

  const handleProfileReset = () => {
    setLocalProfile(profile);
    setProfilePic(profile.profile_pic || null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPass !== confirmPass) {
      alert("New passwords do not match!");
      return;
    }

    if (newPass.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    setPasswordSaveState("SAVING");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/account/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPass,
          new_password: newPass,
        }),
      });

      if (!res.ok) {
        setPasswordSaveState("IDLE");
        const err = await res.json().catch(() => null);
        alert(err?.message || "Password change failed.");
        return;
      }

      setPasswordSaveState("SUCCESS");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => setPasswordSaveState("IDLE"), 2500);
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordSaveState("IDLE");
      alert("Failed to change password. Try again later.");
    }
  };

  const handlePasswordClear = () => {
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveProfile}>
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Profile Information
          </h2>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <div className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {localProfile.name || "Not provided"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contact support to update your name.
              </p>
            </div>

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

          <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 mt-8">
            <button
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${
                profileSaveState === "SUCCESS"
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
              ${
                profileSaveState === "SAVING"
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : ""
              }
            `}
              type="submit"
              disabled={profileSaveState === "SAVING"}
            >
              {profileSaveState === "IDLE" && "Save Changes"}
              {profileSaveState === "SAVING" && "Saving..."}
              {profileSaveState === "SUCCESS" && "Saved!"}
            </button>

            <button
              type="button"
              onClick={handleProfileReset}
              className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <form onSubmit={handlePasswordChange}>
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Change Password
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  id="currentPassword"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="••••••••"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showNewPass ? "text" : "password"}
                  id="newPassword"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="••••••••"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  id="confirmPassword"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              disabled={passwordSaveState === "SAVING"}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${
                passwordSaveState === "SUCCESS"
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
              ${
                passwordSaveState === "SAVING"
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : ""
              }
            `}
            >
              {passwordSaveState === "IDLE" && "Change Password"}
              {passwordSaveState === "SAVING" && "Changing..."}
              {passwordSaveState === "SUCCESS" && "Password Changed!"}
            </button>

            <button
              className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              type="button"
              onClick={handlePasswordClear}
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

