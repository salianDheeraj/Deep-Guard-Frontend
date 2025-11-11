// src/app/dashboard/components/AccountPassword.tsx
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AccountPassword() {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [saveState, setSaveState] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPass !== confirmPass) {
      alert('New passwords do not match!');
      return;
    }

    if (newPass.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setSaveState('SAVING');
    
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current_password: currentPass, 
          new_password: newPass 
        })
      });

      if (res.ok) {
        setSaveState('SUCCESS');
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => setSaveState('IDLE'), 2000);
        alert('Password changed successfully!');
      } else {
        setSaveState('IDLE');
        alert('Password change failed. Please check your current password.');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      setSaveState('IDLE');
      alert('Failed to change password. Please try again.');
    }
  };

  const handleClear = () => {
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <form onSubmit={handlePasswordChange}>
      <div className="bg-white rounded-lg shadow p-8 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Password */}
          <div className="md:col-span-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1">
              <input
                type={showCurrentPass ? "text" : "password"}
                id="currentPassword"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                {showCurrentPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1">
              <input
                type={showNewPass ? "text" : "password"}
                id="newPassword"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowNewPass(!showNewPass)}>
                {showNewPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPass ? "text" : "password"}
                id="confirmPassword"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700"
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-start space-x-3 pt-6 border-t border-gray-200 mt-8">
          <button 
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${saveState === 'SUCCESS' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}
              ${saveState === 'SAVING' ? 'bg-blue-400 text-white cursor-not-allowed' : ''}
            `}
            type="submit"
            disabled={saveState === 'SAVING'}
          >
            {saveState === 'IDLE' && 'Change Password'}
            {saveState === 'SAVING' && 'Changing...'}
            {saveState === 'SUCCESS' && 'Password Changed!'}
          </button>
          <button 
            className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium" 
            type="button"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}
