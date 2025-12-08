"use client";

import React, { useEffect, useState, useRef } from "react";
import { AlertTriangle, Loader2, Trash2, LogOut } from "lucide-react";
import { useAccountPageAnimations } from "@/hooks/useAccountPageAnimations";
import styles from "@/styles/Account.module.css";

// ===========================================================================
// TYPES
// ===========================================================================

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_picture?: string | null;
};

type SaveState = "IDLE" | "SAVING" | "SUCCESS" | "ERROR";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ===========================================================================
// UNIVERSAL CONFIRMATION MODAL
// ===========================================================================

interface ConfirmationModalProps {
  isOpen: boolean;
  type: "analyses" | "account" | "logout";
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  // --- 1. CONFIGURATION BASED ON TYPE ---
  const isLogout = type === "logout";

  // Text & Icons
  const config = {
    title: isLogout ? "Confirm Logout" : "Confirm Deletion",
    targetText: isLogout
      ? "all other devices"
      : type === "analyses"
      ? "all analysis history"
      : "your entire account",
    questionPrefix: isLogout
      ? "Are you sure you want to log out from"
      : "Are you sure you want to permanently delete",
    warningText: isLogout
      ? "You will need to sign in again on those devices."
      : "This action cannot be undone.",
    buttonText: isLogout ? "Logout" : "Delete",
    Icon: isLogout ? LogOut : AlertTriangle,
  };

  // Colors
  // LOGOUT: Blue in Light mode, Teal ('tale') in Dark mode
  // DELETE: Red in both modes
  const colors = isLogout
    ? {
        // Light: Blue-50 | Dark: Teal-900 with opacity
        iconBg: "bg-blue-50 dark:bg-teal-900/20",
        // Light: Blue-600 | Dark: Teal-400
        iconColor: "text-blue-600 dark:text-teal-400",
        // Light: Blue-600 | Dark: Teal-600
        buttonBg: "bg-blue-600 hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-700",
        // Light: Blue ring | Dark: Teal ring
        ring: "ring-blue-50 dark:ring-teal-900/10",
        // Light: Blue text | Dark: Teal text
        warningText: "text-blue-600 dark:text-teal-400",
      }
    : {
        iconBg: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-500",
        buttonBg: "bg-red-600 hover:bg-red-700",
        ring: "ring-red-50 dark:ring-red-900/10",
        warningText: "text-red-500",
      };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
        
        {/* Header Icon */}
        <div className="pt-8 px-6 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ${colors.iconBg} ${colors.ring}`}
          >
            <config.Icon className={`w-8 h-8 ${colors.iconColor}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {config.title}
          </h3>
        </div>

        {/* Body Text */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {config.questionPrefix}{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {config.targetText}
            </span>
            ?
            <br />
            <span
              className={`text-sm mt-2 block font-medium ${colors.warningText}`}
            >
              {config.warningText}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="p-6 pt-2 flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-5 py-2.5 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 ${colors.buttonBg}`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              // Show Trash for deletes, LogOut icon for logout
              isLogout ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? "Processing..." : config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================

export default function AccountSettings(): JSX.Element {
  const pageRef = useRef<HTMLDivElement>(null);
  useAccountPageAnimations(pageRef);

  // --- STATE ---
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
  const [profileSaveState, setProfileSaveState] = useState<SaveState>("IDLE");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("IDLE");

  // --- MODAL STATE ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "analyses" | "account" | "logout";
  }>({
    isOpen: false,
    type: "analyses",
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // --- INITIAL LOAD ---
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
          if (res.status === 401) return (window.location.href = "/login");
          throw new Error("Failed to load profile");
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

  // --- SAVE PROFILE ---
  const saveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setProfileSaveState("SAVING");
    try {
      const res = await fetch(`${API_URL}/api/account/update-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: local.name }),
      });
      if (!res.ok) throw new Error("Update failed");
      setProfileSaveState("SUCCESS");
    } catch (err: any) {
      setProfileSaveState("ERROR");
    } finally {
      setTimeout(() => setProfileSaveState("IDLE"), 1500);
    }
  };

  // --- CHANGE PASSWORD ---
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaveState("SAVING");
    setError(null);
    if (newPass !== confirmPass) {
      setError("Passwords do not match");
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
      if (!res.ok) throw new Error("Change failed");
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

  // --- UNIFIED ACTION HANDLER (For Modal) ---
  const handleConfirmAction = async () => {
    setIsProcessingAction(true);
    try {
      if (modalConfig.type === "analyses") {
        const res = await fetch(`${API_URL}/api/account/delete-analyses`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete analyses");
        setModalConfig((p) => ({ ...p, isOpen: false })); // Close on success
      } else if (modalConfig.type === "account") {
        const res = await fetch(`${API_URL}/api/account/delete-account`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete account");
        window.location.href = "/login";
      } else if (modalConfig.type === "logout") {
        const res = await fetch(`${API_URL}/api/account/logout-all`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to logout");
        setModalConfig((p) => ({ ...p, isOpen: false })); // Close on success
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingAction(false);
    }
  };

  if (loading)
    return (
      <main className={styles.loadingContainer}>
        <p>Loading...</p>
      </main>
    );

  return (
    <main ref={pageRef} className={styles.container}>
      {/* --- CONFIRMATION MODAL --- */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={isProcessingAction}
      />

      <h1 className={styles.header}>Account Settings</h1>
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* Profile Section */}
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

      {/* Password Section */}
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

      {/* Danger Zone */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={styles.card}>
          <h3 className={styles.sectionSubHeader}>Data management</h3>
          <p className={styles.sectionText}>
            Remove all analyses stored in your account.
          </p>
          <button
            onClick={() => setModalConfig({ isOpen: true, type: "analyses" })}
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
            {/* LOGOUT BUTTON - Opens Modal */}
            <button
              onClick={() => setModalConfig({ isOpen: true, type: "logout" })}
              className={styles.buttonOutlineWarning}
            >
              Logout other devices
            </button>

            {/* DELETE ACCOUNT BUTTON - Opens Modal */}
            <button
              onClick={() => setModalConfig({ isOpen: true, type: "account" })}
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