"use client";

import React, { useEffect, useRef, useState } from "react";

type UserProfile = {
  id?: string;
  name: string;
  email: string;
  profile_pic?: string | null;
};

type SaveState = "IDLE" | "SAVING" | "SUCCESS" | "ERROR";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const [profileSaveState, setProfileSaveState] =
    useState<SaveState>("IDLE");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passwordSaveState, setPasswordSaveState] =
    useState<SaveState>("IDLE");

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

        const formatted = {
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          profile_pic: data.profile_pic || null,
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

      const updated = data.user;

      setProfile(updated);
      setLocal(updated);

      setProfileSaveState("SUCCESS");
      setTimeout(() => setProfileSaveState("IDLE"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setProfileSaveState("ERROR");
      setTimeout(() => setProfileSaveState("IDLE"), 1500);
    }
  };

  // =======================================================================
  // CHANGE PASSWORD
  // =======================================================================
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (!res.ok) throw new Error("Failed to change password");

      setPasswordSaveState("SUCCESS");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      setTimeout(() => setPasswordSaveState("IDLE"), 1500);
    } catch (err: any) {
      setError(err.message);
      setPasswordSaveState("ERROR");
      setTimeout(() => setPasswordSaveState("IDLE"), 1500);
    }
  };

  // =======================================================================
  // DELETE ANALYSES
  // =======================================================================
  const deleteAllAnalyses = async () => {
    if (!confirm("Delete all analyses?")) return;

    try {
      const res = await fetch(`${API_URL}/api/account/delete-analyses`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");
      alert("All analyses deleted");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =======================================================================
  // DELETE ACCOUNT
  // =======================================================================
  const deleteAccount = async () => {
    if (!confirm("Delete your entire account?")) return;

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

  // =======================================================================
  // UI
  // =======================================================================
  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {error && (
        <div className="bg-red-100 border p-3 rounded text-red-700">{error}</div>
      )}

      {/* Profile */}
      <section className="bg-white rounded shadow p-6 space-y-4">
        <form onSubmit={saveProfile}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              {local.profile_pic ? (
                <img src={local.profile_pic} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  {local.name.charAt(0)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border px-3 py-2 rounded"
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

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label>Full name</label>
              <input
                className="mt-1 border px-3 py-2 rounded w-full"
                value={local.name}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label>Email</label>
              <input
                className="mt-1 border px-3 py-2 rounded w-full bg-gray-100"
                value={local.email}
                disabled
              />
            </div>
          </div>

          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            {profileSaveState === "SAVING" ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded shadow p-6 space-y-3">
        <h2 className="text-xl font-semibold">Change Password</h2>

        <form onSubmit={changePassword}>
          <input
            type="password"
            placeholder="Current password"
            className="border px-3 py-2 rounded w-full"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            className="border px-3 py-2 rounded w-full"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="border px-3 py-2 rounded w-full"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />

          <button className="px-4 py-2 bg-blue-600 text-white rounded mt-3">
            Change Password
          </button>
        </form>
      </section>

      {/* Data Actions */}
      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-2">Data Management</h3>
          <button
            onClick={deleteAllAnalyses}
            className="border text-red-600 px-4 py-2 rounded"
          >
            Delete all analyses
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
          <button
            onClick={deleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete account
          </button>
        </div>
      </section>
    </main>
  );
}
