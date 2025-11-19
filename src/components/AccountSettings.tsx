"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

// ============================================================================
// 1. HELPER COMPONENTS (Toggle, Modal)
// ============================================================================

const ToggleSwitch: React.FC<{
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}> = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none
        ${enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
};

interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-start">
          <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="mt-3 ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-row-reverse gap-2">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-4 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SUB-COMPONENT: ACCOUNT PROFILE
// ============================================================================

interface AccountProfileProps {
  profile: { name: string; email: string; profile_pic: string };
  onProfileUpdate: (profile: {
    name: string;
    email: string;
    profile_pic: string;
  }) => void;
}

function AccountProfile({ profile, onProfileUpdate }: AccountProfileProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [profilePic, setProfilePic] = useState<string | null>(
    profile.profile_pic || null
  );
  const [saveState, setSaveState] = useState<"IDLE" | "SAVING" | "SUCCESS">("IDLE");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalProfile(profile);
    setProfilePic(profile.profile_pic || null);
  }, [profile]);

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
      setLocalProfile((prev) => ({ ...prev, profile_pic: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("SAVING");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/account`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localProfile),
      });
      if (!res.ok) throw new Error("Failed");
      onProfileUpdate(localProfile);
      setSaveState("SUCCESS");
      setTimeout(() => setSaveState("IDLE"), 2000);
    } catch (error) {
      alert("Failed to save profile.");
      setSaveState("IDLE");
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profile Information</h2>
        <div className="flex items-center mb-8">
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {localProfile.name ? localProfile.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="ml-4">
            <span className="text-lg font-semibold text-gray-800 dark:text-white">{localProfile.name || "User"}</span>
            <span className="block text-sm text-gray-500 dark:text-gray-400">{localProfile.email}</span>
            <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1" onClick={() => fileInputRef.current?.click()}>
              Change Profile Photo
            </button>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/png, image/jpeg" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Full Name</label>
            <input type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-blue-500"
              value={localProfile.name} onChange={(e) => setLocalProfile((prev) => ({ ...prev, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">Email Address</label>
            <input type="email" disabled value={localProfile.email} className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-400 cursor-not-allowed" />
          </div>
        </div>
        <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button type="submit" disabled={saveState === "SAVING"} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${saveState === "SUCCESS" ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"} ${saveState === "SAVING" ? "bg-blue-400" : ""}`}>
            {saveState === "IDLE" && "Save Changes"}
            {saveState === "SAVING" && "Saving..."}
            {saveState === "SUCCESS" && "Saved!"}
          </button>
          <button type="button" onClick={() => { setLocalProfile(profile); setProfilePic(profile.profile_pic || null); }} className="px-5 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// 3. SUB-COMPONENT: ACCOUNT PASSWORD
// ============================================================================

function AccountPassword() {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [saveState, setSaveState] = useState<"IDLE" | "SAVING" | "SUCCESS">("IDLE");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) return alert("New passwords do not match!");
    if (newPass.length < 8) return alert("Password must be at least 8 characters long.");
    setSaveState("SAVING");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPass, new_password: newPass }),
      });
      if (!res.ok) { setSaveState("IDLE"); return alert("Password change failed."); }
      setSaveState("SUCCESS");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setTimeout(() => setSaveState("IDLE"), 2500);
      alert("Password changed successfully!");
    } catch (error) { setSaveState("IDLE"); alert("Failed to change password."); }
  };

  const PasswordInput = ({ id, label, value, onChange, show, onToggle }: any) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative mt-1">
        <input type={show ? "text" : "password"} id={id} className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-blue-500" placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)} required />
        <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={onToggle}>
          {show ? <EyeOff size={18} className="text-gray-400 dark:text-gray-500" /> : <Eye size={18} className="text-gray-400 dark:text-gray-500" />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handlePasswordChange}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 mt-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <PasswordInput id="currentPassword" label="Current Password" value={currentPass} onChange={setCurrentPass} show={showCurrentPass} onToggle={() => setShowCurrentPass(!showCurrentPass)} />
          </div>
          <PasswordInput id="newPassword" label="New Password" value={newPass} onChange={setNewPass} show={showNewPass} onToggle={() => setShowNewPass(!showNewPass)} />
          <PasswordInput id="confirmPassword" label="Confirm New Password" value={confirmPass} onChange={setConfirmPass} show={showConfirmPass} onToggle={() => setShowConfirmPass(!showConfirmPass)} />
        </div>
        <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button type="submit" disabled={saveState === "SAVING"} className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${saveState === "SUCCESS" ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"} ${saveState === "SAVING" ? "bg-blue-400 cursor-not-allowed" : ""}`}>
            {saveState === "IDLE" && "Change Password"} {saveState === "SAVING" && "Changing..."} {saveState === "SUCCESS" && "Password Changed!"}
          </button>
          <button className="px-5 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-sm font-medium" type="button" onClick={() => { setCurrentPass(""); setNewPass(""); setConfirmPass(""); }}>
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// 4. SUB-COMPONENT: ACCOUNT DATA MANAGEMENT
// ============================================================================

function AccountDataManagement() {
  const [isAutoDeleteEnabled, setIsAutoDeleteEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ModalProps, "onCancel">>({ title: "", message: "", onConfirm: () => {}, });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const openDeleteAllModal = () => {
    setModalProps({
      title: "Delete All Analyses",
      message: "Are you sure you want to delete ALL analyses? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/delete-analyses`, { method: "DELETE", credentials: "include" });
          setIsModalOpen(false);
          if (!res.ok) return alert("Failed to delete analyses.");
          alert("All analyses deleted successfully!");
        } catch (error) { alert("Something went wrong."); }
      },
    });
    setIsModalOpen(true);
  };

  const openDeleteAccountModal = () => {
    setModalProps({
      title: "Delete Account",
      message: "Are you sure you want to delete your account? All your data will be permanently removed.",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/delete-account`, { method: "DELETE", credentials: "include" });
          setIsModalOpen(false);
          if (!res.ok) return alert("Failed to delete account.");
          window.location.href = "/login";
        } catch (error) { alert("Something went wrong."); }
      },
    });
    setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && <ConfirmationModal {...modalProps} onCancel={() => setIsModalOpen(false)} />}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 mt-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Data Management</h2>
        <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg transition-colors">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white">Auto-delete analyses</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically remove analyses after 30 days</p>
          </div>
          <ToggleSwitch enabled={isAutoDeleteEnabled} onToggle={setIsAutoDeleteEnabled} />
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
            <span className="text-gray-500 dark:text-gray-400">2.4 GB / 10 GB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5">
            <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: "24%" }}></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">127 analyses stored</span>
        </div>
        <button type="button" className="w-full py-2.5 border border-red-500 dark:border-red-600 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors" onClick={openDeleteAllModal}>
          Delete All Analyses
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 mt-6 mb-4 border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-4">Danger Zone</h2>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 transition-colors">
          <h3 className="font-medium text-red-700 dark:text-red-400">Delete Account</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">Once you delete your account, all your data will be permanently removed.</p>
          <button type="button" className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors" onClick={openDeleteAccountModal}>
            Delete My Account
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// 5. MAIN COMPONENT: ACCOUNT SETTINGS PAGE
// ============================================================================

interface UserProfile {
  name: string;
  email: string;
  profile_pic: string;
}

export default function AccountSettings() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", profile_pic: "" });
  const [loading, setLoading] = useState(true);
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await fetch("/api/account", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProfile(data);
      } catch (error) { console.error("❌ Error:", error); } 
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  // GSAP Animation
  const hasAnimated = useRef(false);
  useLayoutEffect(() => {
    if (!loading && mainContentRef.current && !hasAnimated.current) {
      hasAnimated.current = true;
      const container = mainContentRef.current;
      const items = container.children;
      gsap.set(items, { opacity: 0, y: 40, scale: 0.95 });
      gsap.to(items, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.2)", clearProps: "all" });
    }
  }, [loading]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => setProfile(updatedProfile);

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main ref={mainContentRef} className="flex-1 p-6 flex flex-col h-full overflow-y-auto space-y-6">
      <div className="flex flex-col origin-left">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your profile and preferences</p>
      </div>
      <AccountProfile profile={profile} onProfileUpdate={handleProfileUpdate} />
      <AccountPassword />
      <AccountDataManagement />
    </main>
  );
}