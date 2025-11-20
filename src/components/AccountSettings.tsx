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
      <main className="flex-1 p-6 flex items-center justify-center h-full">
        <p>Loading account settings...</p>
      </main>
    );
  }

  return (
    <main ref={pageRef} className="flex-1 p-6 flex flex-col h-full space-y-6">
      <h1 className="text-3xl font-bold account-header">Account Settings</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* PROFILE */}
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border account-card">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold">
              {local.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full name</label>
              <input
                value={local.name}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, name: e.target.value }))
                }
                className="mt-1 block w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                value={local.email}
                disabled
                className="mt-1 block w-full px-3 py-2 border bg-gray-50 cursor-not-allowed rounded"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded action-button"
              disabled={profileSaveState === "SAVING"}
            >
              {profileSaveState === "SAVING" ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* PASSWORD */}
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border account-card">
        <h2 className="text-lg font-semibold mb-4">Change password</h2>

        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="block text-sm">Current password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm">New password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm">Confirm new password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </div>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded action-button"
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border account-card">
          <h3 className="font-semibold">Data management</h3>
          <p className="text-sm text-gray-500 my-2">
            Remove all analyses stored in your account.
          </p>
          <button
            onClick={deleteAllAnalyses}
            className="px-4 py-2 border text-red-600 rounded danger-button"
          >
            Delete all analyses
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border account-card">
          <h3 className="font-semibold text-red-600">Danger zone</h3>
          <p className="text-sm text-gray-500 my-2">
            Deleting your account removes all data permanently.
          </p>

          {/* NEW BUTTON */}
          <button
            onClick={logoutOtherDevices}
            className="px-4 py-2 border text-yellow-700 rounded mb-3 action-button"
          >
            Logout other devices
          </button>

          <button
            onClick={deleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded danger-button"
          >
            Delete account
          </button>
        </div>
      </section>
    </main>
  );
}
