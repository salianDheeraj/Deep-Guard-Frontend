"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, Camera, Lock, Trash2, Save, AlertTriangle } from "lucide-react";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_pic?: string | null;
};

type SaveState = "IDLE" | "SAVING" | "SUCCESS" | "ERROR";

// 🚨 CRITICAL FIX: Use empty string to leverage Next.js Rewrite Proxy
// This ensures cookies work correctly across environments.
const API_URL = ""; 

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
export default function AccountSettings(): JSX.Element {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    profile_pic: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [local, setLocal] = useState<UserProfile>({
    name: "",
    email: "",
    profile_pic: null,
  });

  const [profileSaveState, setProfileSaveState] = useState<SaveState>("IDLE");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("IDLE");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =======================================================================
  // LOAD PROFILE
  // =======================================================================
  useEffect(() => {
    (async function loadProfile() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();

        // Handle inconsistent backend response structures safely
        const formatted = {
          id: data.user?.id || data.id,
          name: data.user?.name || data.name || "",
          email: data.user?.email || data.email || "",
          profile_pic: data.user?.profile_pic || data.profile_pic || null,
        };

        setProfile(formatted);
        setLocal(formatted);
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =======================================================================
  // PROFILE PIC HANDLING
  // =======================================================================
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    // Size Check (e.g. 5MB)
    if (f.size > 5 * 1024 * 1024) {
      alert("File is too large (Max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocal((prev) => ({ ...prev, profile_pic: reader.result as string }));
    };
    reader.readAsDataURL(f);
  };

  // =======================================================================
  // SAVE PROFILE
  // =======================================================================
  const saveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setProfileSaveState("SAVING");
    setError(null); // Clear previous errors

    try {
      const res = await fetch(`${API_URL}/api/account/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: local.name,
          profile_pic: local.profile_pic,
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      const updated = data.user || data; // Handle likely response shape

      setProfile(updated);
      setLocal(updated);

      setProfileSaveState("SUCCESS");
      setTimeout(() => setProfileSaveState("IDLE"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setProfileSaveState("ERROR");
      setTimeout(() => setProfileSaveState("IDLE"), 2000);
    }
  };

  // =======================================================================
  // CHANGE PASSWORD
  // =======================================================================
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ FIX: Validate Confirm Password
    if (newPass !== confirmPass) {
      setError("New passwords do not match");
      return;
    }

    if (newPass.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setPasswordSaveState("SAVING");

    try {
      const res = await fetch(`${API_URL}/api/account/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPass,
          new_password: newPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSaveState("SUCCESS");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => setPasswordSaveState("IDLE"), 2000);
    } catch (err: any) {
      setError(err.message);
      setPasswordSaveState("ERROR");
      setTimeout(() => setPasswordSaveState("IDLE"), 2000);
    }
  };

  // =======================================================================
  // DELETE ANALYSES
  // =======================================================================
  const deleteAllAnalyses = async () => {
    if (!confirm("Are you sure you want to delete all analysis history? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete-analyses`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete history");
      alert("All analyses deleted successfully");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =======================================================================
  // DELETE ACCOUNT
  // =======================================================================
  const deleteAccount = async () => {
    const confirmation = prompt("Type 'DELETE' to confirm account deletion. This action is irreversible.");
    if (confirmation !== "DELETE") return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      // Redirect to login
      window.location.href = "/login";
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =======================================================================
  // UI RENDER
  // =======================================================================
  if (loading) {
    return (
      <main className="flex-1 p-10 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-cyan-400" />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 p-4 md:p-8 space-y-6 md:space-y-8 transition-colors">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Account Settings
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
          Manage your personal information and security preferences.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-center text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      {/* --- PROFILE SECTION --- */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 md:p-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6">
          Profile Details
        </h2>
        
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700">
                {local.profile_pic ? (
                  <img src={local.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl font-bold text-gray-400">
                    {local.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Camera className="text-white w-6 h-6" />
              </div>
            </div>
            
            <div>
               <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-200"
              >
                Change Photo
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={local.name}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                value={local.email}
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={profileSaveState === "SAVING"}
              className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  profileSaveState === "SUCCESS" ? "bg-green-600 hover:bg-green-700" : 
                  profileSaveState === "ERROR" ? "bg-red-600 hover:bg-red-700" : 
                  "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {profileSaveState === "SAVING" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : profileSaveState === "SUCCESS" ? (
                <>
                  <Save className="w-4 h-4" /> Saved!
                </>
              ) : profileSaveState === "ERROR" ? (
                "Failed"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </section>

      {/* --- PASSWORD SECTION --- */}
      <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            Change Password
            </h2>
        </div>

        <form onSubmit={changePassword} className="space-y-4 max-w-2xl">
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
              />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
                type="submit"
                disabled={passwordSaveState === "SAVING"}
                className={`flex items-center gap-2 px-6 py-2 border text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    passwordSaveState === "SUCCESS" ? "bg-green-50 border-green-200 text-green-700" :
                    "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
            >
                 {passwordSaveState === "SAVING" ? (
                    <><Loader2 className="w-4 h-4 animate-spin"/> Updating...</>
                 ) : passwordSaveState === "SUCCESS" ? (
                    "Password Updated!"
                 ) : (
                    "Update Password"
                 )}
            </button>
          </div>
        </form>
      </section>

      {/* --- DANGER ZONE --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Data Management */}
        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Data Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Permanently delete all your analysis history. This action cannot be undone.
          </p>
          <button
            onClick={deleteAllAnalyses}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete all analyses
          </button>
        </div>

        {/* Account Deletion */}
        <div className="bg-red-50 dark:bg-red-900/10 p-4 md:p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-red-600/80 dark:text-red-300/70 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button
            onClick={deleteAccount}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </section>
    </main>
  );
}