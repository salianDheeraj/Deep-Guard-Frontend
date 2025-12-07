"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAccountPageAnimations } from "@/hooks/useAccountPageAnimations";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_picture?: string | null;
};

type SaveState = "IDLE" | "SAVING" | "SUCCESS" | "ERROR";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AccountSettings(): JSX.Element {
  // ============================================
  // ANIMATION SCOPE
  // ============================================
  const pageRef = useRef<HTMLDivElement>(null);
  useAccountPageAnimations(pageRef);

  // ============================================
  // STATE
  // ============================================
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    profile_picture: null,
  });

  const [local, setLocal] = useState<UserProfile>({
    name: "",
    email: "",
    profile_picture: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileSaveState, setProfileSaveState] =
    useState<SaveState>("IDLE");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordSaveState, setPasswordSaveState] =
    useState<SaveState>("IDLE");

  // ============================================
  // LOAD PROFILE
  // ============================================
  useEffect(() => {
    (async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt.substring(0, 200));
        }

        const data = await res.json();
        setProfile(data);
        setLocal(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ============================================
  // SAVE PROFILE — NAME ONLY
  // ============================================
  const saveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setProfileSaveState("SAVING");
    setError(null);

    try {
      const payload = { name: local.name };

      const res = await fetch(`${API_URL}/api/account/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Update failed");
      }

      const data = await res.json();
      const updated = data.user || data;

      setProfile(updated);
      setLocal(updated);
      setProfileSaveState("SUCCESS");
    } catch (err: any) {
      setError(err.message);
      setProfileSaveState("ERROR");
    } finally {
      setTimeout(() => setProfileSaveState("IDLE"), 1500);
    }
  };

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaveState("SAVING");
    setError(null);

    if (newPass !== confirmPass) {
      setError("New passwords do not match");
      setPasswordSaveState("ERROR");
      return;
    }

    if (newPass.length < 8) {
      setError("Password must be at least 8 characters");
      setPasswordSaveState("ERROR");
      return;
    }

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

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Password change failed");
      }

      setPasswordSaveState("SUCCESS");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      setError(err.message);
      setPasswordSaveState("ERROR");
    } finally {
      setTimeout(() => setPasswordSaveState("IDLE"), 1500);
    }
  };

  // ============================================
  // DELETE ANALYSES
  // ============================================
  const deleteAllAnalyses = async () => {
    if (!confirm("Delete all analyses?")) return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete-analyses`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");

      alert("All analyses deleted.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ============================================
  // LOGOUT OTHER DEVICES
  // ============================================
  const logoutOtherDevices = async () => {
    if (!confirm("Log out from all other devices?")) return;

    try {
      const res = await fetch(`${API_URL}/api/account/logout-all`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Failed to logout other devices");
      }

      alert("Logged out from all other devices.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const deleteAccount = async () => {
    if (!confirm("Delete account permanently?")) return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");

      window.location.href = "/login";
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ============================================
  // UI
  // ============================================
  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center h-full dark:bg-slate-950">
        <p className="dark:text-gray-300">Loading account settings...</p>
      </main>
    );
  }

  return (
    // Added dark:bg-slate-950 to main wrapper
    <main ref={pageRef} className="flex-1 p-6 flex flex-col h-full space-y-6 dark:bg-slate-950 transition-colors">

      {/* Added dark:text-white */}
      <h1 className="text-3xl font-bold account-header text-gray-900 dark:text-white">Account Settings</h1>

      {error && (
        // Added dark mode colors for error box
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* PROFILE */}
      {/* Added dark:bg-slate-800 and dark:border-gray-700 */}
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 account-card">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Added dark:bg-slate-700 dark:text-gray-200 */}
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-gray-600 dark:text-gray-200">
              {local.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Added dark:text-gray-300 */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
              {/* Added dark:bg-slate-900 dark:border-gray-600 dark:text-white */}
              <input
                value={local.name}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>

            <div>
              {/* Added dark:text-gray-300 */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              {/* Added dark:bg-slate-700 dark:text-gray-400 dark:border-gray-600 */}
              <input
                value={local.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed rounded"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded action-button hover:bg-blue-700 transition-colors"
              disabled={profileSaveState === "SAVING"}
            >
              {profileSaveState === "SAVING" ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* PASSWORD */}
      {/* Added dark:bg-slate-800 dark:border-gray-700 */}
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 account-card">
        {/* Added dark:text-white */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Change password</h2>

        <form onSubmit={changePassword} className="space-y-3">
          <div>
            {/* Added dark:text-gray-300 */}
            <label className="block text-sm text-gray-700 dark:text-gray-300">Current password</label>
            {/* Added dark:bg-slate-900 dark:border-gray-600 dark:text-white */}
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            {/* Added dark:text-gray-300 */}
            <label className="block text-sm text-gray-700 dark:text-gray-300">New password</label>
            {/* Added dark:bg-slate-900 dark:border-gray-600 dark:text-white */}
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <div>
            {/* Added dark:text-gray-300 */}
            <label className="block text-sm text-gray-700 dark:text-gray-300">Confirm new password</label>
            {/* Added dark:bg-slate-900 dark:border-gray-600 dark:text-white */}
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded action-button hover:bg-blue-700 transition-colors"
            disabled={passwordSaveState === "SAVING"}
          >
            {passwordSaveState === "SAVING"
              ? "Changing..."
              : "Change password"}
          </button>
        </form>
      </section>

      {/* DANGER ZONE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Added dark:bg-slate-800 dark:border-gray-700 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 account-card">
          {/* Added dark:text-white */}
          <h3 className="font-semibold text-gray-900 dark:text-white">Data management</h3>
          {/* Added dark:text-gray-400 */}
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
            Remove all analyses stored in your account.
          </p>
          <button
            onClick={deleteAllAnalyses}
            // Added dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20
            className="px-4 py-2 border border-red-200 text-red-600 rounded danger-button hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete all analyses
          </button>
        </div>

        {/* Added dark:bg-slate-800 dark:border-gray-700 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 account-card">
          {/* Added dark:text-red-500 */}
          <h3 className="font-semibold text-red-600 dark:text-red-500">Danger zone</h3>
          {/* Added dark:text-gray-400 */}
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
            Deleting your account removes all data permanently.
          </p>

          {/* Added flex-col to stack buttons vertically */}
          <div className="flex flex-col gap-3">
            <button
              onClick={logoutOtherDevices}
              // Added dark:border-yellow-900/30 dark:text-yellow-500 dark:hover:bg-yellow-900/20
              className="px-4 py-2 border border-yellow-200 text-yellow-700 rounded mb-3 action-button hover:bg-yellow-50 dark:border-yellow-900/30 dark:text-yellow-500 dark:hover:bg-yellow-900/20 transition-colors block w-full text-left sm:w-auto"
            >
              Logout other devices
            </button>

            <button
              onClick={deleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded danger-button hover:bg-red-700 transition-colors block w-full text-left sm:w-auto"
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}