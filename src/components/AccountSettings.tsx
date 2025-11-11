// src/app/dashboard/account/AccountSettings.tsx
"use client";

import React, { useState, useEffect } from 'react';
import AccountProfile from '../components/AccountProfile';
import AccountPassword from '../components/AccountPassword';
import AccountDataManagement from '../components/AccountDataManagement';

export default function AccountSettings() {
  const [profile, setProfile] = useState({ name: '', email: '', profile_pic: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/account');
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedProfile: typeof profile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500 mt-2">Manage your profile and preferences</p>
      </div>

      <AccountProfile profile={profile} onProfileUpdate={handleProfileUpdate} />
      <AccountPassword />
      <AccountDataManagement />
    </main>
  );
}
