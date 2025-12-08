"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAccountPageAnimations } from "@/hooks/useAccountPageAnimations";
import styles from "@/styles/Account.module.css";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_picture?: string | null;
  isTrial?: boolean;
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
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
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
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
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
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
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
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
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
      <main className={styles.loadingContainer}>
        <p>Loading account settings...</p>
      </main>
    );
  }

  return (
    <main ref={pageRef} className={`${styles.container} relative`}>

      {/* TRIAL BLUR OVERLAY */}
      {(profile.isTrial || profile.email === 'guest@trial.com') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Settings Restricted</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Trial users cannot modify account settings. <br />
              Please create an account to access these features.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Sign In
              </a>
              <a href="/signup" className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-medium rounded-lg transition-colors">
                Create Account
              </a>
            </div>
          </div>
        </div>
      )}

      <h1 className={styles.header}>Account Settings</h1>

      {error && (
        <div className={styles.errorBox}>
          {error}
        </div>
      )}

      {/* PROFILE */}
      <section className={styles.card}>
        <form onSubmit={saveProfile} className={styles.formGroup}>
          <div className="flex items-center gap-4">
            <div className={styles.profilePicWrapper}>
              {local.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={styles.label}>Full name</label>
              <input
                value={local.name}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, name: e.target.value }))
                }
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.label}>Email</label>
              <input
                value={local.email}
                disabled
                className={styles.disabledInput}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.buttonPrimary}
              disabled={profileSaveState === "SAVING"}
            >
              {profileSaveState === "SAVING" ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* PASSWORD */}
      <section className={styles.card}>
        <h2 className={styles.sectionHeader}>Change password</h2>

        <form onSubmit={changePassword} className={styles.formGroup}>
          <div>
            <label className={styles.label}>Current password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>New password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.label}>Confirm new password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className={styles.input}
            />
          </div>

          <button
            className={styles.buttonPrimary}
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
        <div className={styles.card}>
          <h3 className={styles.sectionSubHeader}>Data management</h3>
          <p className={styles.sectionText}>
            Remove all analyses stored in your account.
          </p>
          <button
            onClick={deleteAllAnalyses}
            className={styles.buttonOutlineDanger}
          >
            Delete all analyses
          </button>
        </div>

        <div className={styles.card}>
          <h3 className={styles.dangerHeader}>Danger zone</h3>
          <p className={styles.sectionText}>
            Deleting your account removes all data permanently.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={logoutOtherDevices}
              className={styles.buttonOutlineWarning}
            >
              Logout other devices
            </button>

            <button
              onClick={deleteAccount}
              className={styles.buttonDanger}
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

