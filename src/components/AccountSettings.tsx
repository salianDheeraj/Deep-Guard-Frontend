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

  const colors = isLogout
    ? {
        iconBg: "bg-blue-50 dark:bg-teal-900/20",
        iconColor: "text-blue-600 dark:text-teal-400",
        buttonBg: "bg-blue-600 hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-700",
        warningText: "text-blue-600 dark:text-teal-400",
        ring: "ring-blue-50 dark:ring-teal-900/10",
      }
    : {
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
            className={`flex-1 px-5 py-2.5 text-white rounded-lg flex items-center justify-center gap-2 shadow-lg ${colors.buttonBg} disabled:opacity-70`}
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

  // Success pulse animation — FIXED ✔
  const pulseSuccess = (el: HTMLElement | null) => {
    if (!el) return;

    gsap.to(el, {
      boxShadow: "0 0 20px rgba(34,197,94,0.4)",
      scale: 1.01,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        gsap.set(el, { clearProps: "boxShadow,scale" }); // ✔ VALID RETURN TYPE
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

  // =======================================================================
  // RENDER
  // =======================================================================
  if (loading)
    return (
      <main className={styles.loadingContainer}>
        <p>Loading...</p>
      </main>
    );

  return (
    <main ref={pageRef} className={styles.container}>
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
          <div className="flex items-center gap-4">
            <div className={`${styles.profilePicWrapper} profile-pic-wrapper`}>
              {local.profile_pic ? (
                <img
                  src={local.profile_pic}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                local.name?.charAt(0).toUpperCase()
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border px-3 py-2 rounded dark:border-gray-600 dark:text-gray-200 action-button"
            >
              Change photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <button
            className={`${styles.buttonPrimary} action-button`}
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

          <button
            className={`${styles.buttonPrimary} action-button`}
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
