"use client";

import React, { useEffect, useState, useRef } from "react";
import { AlertTriangle, Loader2, Trash2, LogOut } from "lucide-react";
import { useAccountPageAnimations } from "@/hooks/useAccountPageAnimations";
import styles from "@/styles/Account.module.css";
import gsap from "gsap";

// ===========================================================================
// TYPES
// ===========================================================================
type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_picture?: string | null;
  isTrial?: boolean;
  profile_pic?: string | null;
};

type SaveState = "IDLE" | "SAVING" | "SUCCESS" | "ERROR";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ===========================================================================
// CONFIRMATION MODAL
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
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        gsap.fromTo(
          modalRef.current,
          { scale: 0.9, opacity: 0, y: 10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
        );
      });
      return () => ctx.revert();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLogout = type === "logout";

  const config = {
    title: isLogout ? "Confirm Logout" : "Confirm Deletion",
    targetText:
      isLogout
        ? "all other devices"
        : type === "analyses"
          ? "all analysis history"
          : "your entire account",
    questionPrefix:
      isLogout
        ? "Are you sure you want to log out from"
        : "Are you sure you want to permanently delete",
    warningText:
      isLogout
        ? "You will need to sign in again on those devices."
        : "This action cannot be undone.",
    buttonText: isLogout ? "Logout" : "Delete",
    Icon: isLogout ? LogOut : AlertTriangle,
  };

  // UPDATED COLORS: Blue+Pink / Cyan+Purple
  const colors = isLogout
    ? {
      iconBg: "bg-blue-50 dark:bg-cyan-900/20",
      iconColor: "text-blue-600 dark:text-cyan-400",
      // Gradient Button
      buttonBg: "bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 dark:from-cyan-400 dark:to-purple-600 dark:hover:from-cyan-500 dark:hover:to-purple-700",
      warningText: "text-blue-600 dark:text-cyan-400",
      ring: "ring-blue-50 dark:ring-cyan-900/10",
    }
    : {
      // Delete actions remain Red for safety semantics
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-500",
      buttonBg: "bg-red-600 hover:bg-red-700",
      warningText: "text-red-500",
      ring: "ring-red-50 dark:ring-red-900/10",
    };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-[400px] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="pt-8 px-6 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ${colors.iconBg} ${colors.ring}`}
          >
            <config.Icon className={`w-8 h-8 ${colors.iconColor}`} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            {config.title}
          </h3>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {config.questionPrefix}{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {config.targetText}
            </span>
            ?
            <br />
            <span
              className={`block mt-2 text-sm font-medium ${colors.warningText}`}
            >
              {config.warningText}
            </span>
          </p>
        </div>

        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-5 py-2.5 bg-gray-200 dark:bg-slate-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-5 py-2.5 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg border-0 ${colors.buttonBg} disabled:opacity-70`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <config.Icon className="w-4 h-4" />
            )}
            {isLoading ? "Processing..." : config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===========================================================================
// MAIN PAGE COMPONENT
// ===========================================================================
export default function AccountSettings(): JSX.Element {
  const pageRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLElement>(null);
  const passwordCardRef = useRef<HTMLElement>(null);

  // 🚀 RUN HOOK FOR PAGE ENTRANCE ANIMATIONS
  useAccountPageAnimations(pageRef);

  // Shake animation for errors
  const shakeCard = (el: HTMLElement | null) => {
    if (!el) return;
    gsap.fromTo(
      el,
      { x: -10 },
      { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)", clearProps: "x" }
    );
  };

  // Success pulse animation
  const pulseSuccess = (el: HTMLElement | null) => {
    if (!el) return;

    gsap.to(el, {
      boxShadow: "0 0 20px rgba(34,197,94,0.4)", // Kept green for success feedback
      scale: 1.01,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gsap.set(el, { clearProps: "boxShadow,scale" });
      },
    });
  };

  // =======================================================================
  // STATE
  // =======================================================================
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    profile_pic: null,
  });
  const [local, setLocal] = useState<UserProfile>({
    name: "",
    email: "",
    profile_pic: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileSaveState, setProfileSaveState] = useState<SaveState>("IDLE");
  const [passwordSaveState, setPasswordSaveState] = useState<SaveState>("IDLE");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "analyses" | "account" | "logout";
  }>({
    isOpen: false,
    type: "analyses",
  });

  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =======================================================================
  // LOAD PROFILE
  // ===========================================================================
  useEffect(() => {
    (async function loadProfile() {
      setLoading(true);
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

        setLocal({
          ...data,
          profile_pic: data.profile_pic || data.profile_picture || null,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =======================================================================
  // HANDLERS
  // ===========================================================================
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocal((prev) => ({ ...prev, profile_pic: reader.result as string }));
    };
    reader.readAsDataURL(f);
  };

  const saveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setProfileSaveState("SAVING");

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

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      setProfile(data.user);
      setLocal(data.user);

      setProfileSaveState("SUCCESS");
      pulseSuccess(profileCardRef.current);

      window.dispatchEvent(new Event("user-profile-updated"));
    } catch (err: any) {
      setProfileSaveState("ERROR");
      shakeCard(profileCardRef.current);
    } finally {
      setTimeout(() => setProfileSaveState("IDLE"), 1500);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaveState("SAVING");
    setError(null);

    if (newPass !== confirmPass) {
      setError("Passwords do not match");
      setPasswordSaveState("ERROR");
      shakeCard(passwordCardRef.current);
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
      pulseSuccess(passwordCardRef.current);

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      setError(err.message);
      setPasswordSaveState("ERROR");
      shakeCard(passwordCardRef.current);
    } finally {
      setTimeout(() => setPasswordSaveState("IDLE"), 1500);
    }
  };

  const handleConfirmAction = async () => {
    setIsProcessingAction(true);

    try {
      if (modalConfig.type === "analyses") {
        const res = await fetch(`${API_URL}/api/account/delete-analyses`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete analyses");
      }

      if (modalConfig.type === "logout") {
        const res = await fetch(`${API_URL}/api/account/logout-all`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to logout");
      }

      if (modalConfig.type === "account") {
        const res = await fetch(`${API_URL}/api/account/delete-account`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete account");
        window.location.href = "/login";
      }

      setModalConfig((p) => ({ ...p, isOpen: false }));
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
    <main ref={pageRef} className={`${styles.container} relative`}>

      {/* TRIAL BLUR OVERLAY */}
      {(profile.isTrial || profile.email === 'guest@trial.com') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-lg pt-20">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center max-w-md mx-4 relative z-50">
            {/* Icon: Solid Blue / Cyan */}
            <div className="w-16 h-16 bg-blue-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-8 h-8 text-blue-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Account Settings Restricted</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Trial users cannot modify account settings. <br />
              Please create an account to access these features.
            </p>
            <div className="flex gap-3 justify-center">
              {/* Sign In Button: Gradient */}
              <a href="/login" className="px-6 py-2.5 font-medium rounded-lg transition-colors text-white border-0 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 dark:from-cyan-400 dark:to-purple-600 dark:hover:from-cyan-500 dark:hover:to-purple-700">
                Sign In
              </a>
              <a href="/signup" className="px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-medium rounded-lg transition-colors">
                Create Account
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        onClose={() => setModalConfig((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmAction}
        isLoading={isProcessingAction}
      />

      {/* HEADER */}
      <div className="account-header">
        <h1 className={`${styles.header}`}>Account Settings</h1>
        {error && <div className={styles.errorBox}>{error}</div>}
      </div>

      {/* PROFILE CARD */}
      <section ref={profileCardRef} className={`${styles.card} account-card`}>
        <form onSubmit={saveProfile} className={styles.formGroup}>
          <div className="flex items-center gap-6">
            <div className="relative group">
              {/* PROFILE RING: Gradient Blue+Pink / Cyan+Purple */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 dark:from-cyan-400 dark:to-purple-500 opacity-70 group-hover:opacity-100 blur-[2px] transition-all"></div>
              <div className="relative w-24 h-24 rounded-full bg-white dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-800 z-10 flex items-center justify-center">
                {local.profile_pic ? (
                  <img
                    src={local.profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-4xl font-bold text-gray-400 dark:text-gray-500">
                    {local.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              {/* CHANGE PHOTO BUTTON: Hover Text/Border Blue / Cyan */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium hover:border-blue-500 dark:hover:border-cyan-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-all bg-white dark:bg-slate-800 dark:text-gray-200 shadow-sm"
              >
                Change photo
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                JPG, GIF or PNG. Max size of 2MB.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label className={styles.label}>Full name</label>
              <input
                value={local.name}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, name: e.target.value }))
                }
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Email</label>
              <input value={local.email} disabled className={styles.disabledInput} />
            </div>
          </div>

          {/* SAVE BUTTON: Gradient Blue+Pink / Cyan+Purple */}
          <button
            className="mt-4 px-6 py-2.5 rounded-lg font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 dark:from-cyan-400 dark:to-purple-600 dark:hover:from-cyan-500 dark:hover:to-purple-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border-0"
            disabled={profileSaveState === "SAVING"}
          >
            {profileSaveState === "SAVING" ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      {/* PASSWORD CARD */}
      <section ref={passwordCardRef} className={`${styles.card} account-card`}>
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

          {/* CHANGE PASSWORD BUTTON: Gradient Blue+Pink / Cyan+Purple */}
          <button
            className={`${styles.buttonPrimary} action-button !bg-gradient-to-r !from-blue-600 !to-pink-500 hover:!from-blue-700 hover:!to-pink-600 dark:!from-cyan-400 dark:!to-purple-600 dark:hover:!from-cyan-500 dark:hover:!to-purple-700 !border-0`}
            disabled={passwordSaveState === "SAVING"}
          >
            {passwordSaveState === "SAVING" ? "Changing..." : "Change password"}
          </button>
        </form>
      </section>

      {/* DANGER ZONE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${styles.card} account-card`}>
          <h3 className={styles.sectionSubHeader}>Data management</h3>
          <p className={styles.sectionText}>
            Remove all analyses stored in your account.
          </p>

          <button
            onClick={() => setModalConfig({ isOpen: true, type: "analyses" })}
            className={`${styles.buttonOutlineDanger} danger-button`}
          >
            Delete all analyses
          </button>
        </div>

        <div className={`${styles.card} account-card`}>
          <h3 className={styles.dangerHeader}>Danger zone</h3>
          <p className={styles.sectionText}>
            Deleting your account removes all data permanently.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setModalConfig({ isOpen: true, type: "logout" })}
              className={`${styles.buttonOutlineWarning} danger-button`}
            >
              Logout other devices
            </button>

            <button
              onClick={() => setModalConfig({ isOpen: true, type: "account" })}
              className={`${styles.buttonDanger} danger-button`}
            >
              Delete account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}