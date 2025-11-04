// src/app/dashboard/account/page.tsx
"use client";

import React, { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'; // Import AlertTriangle for modal

// --- Reusable Toggle Switch Component ---
const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: (enabled: boolean) => void }> = ({ enabled, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors
        ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};

// --- Reusable Modal Component ---
interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Account Page Component ---
export default function AccountPage() {
  const [isAutoDeleteEnabled, setIsAutoDeleteEnabled] = useState(true);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // State for controlled inputs
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // State for save button
  const [saveState, setSaveState] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE');

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ModalProps, 'onCancel'>>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // --- Event Handlers ---
  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState('SAVING');
    setTimeout(() => {
      setSaveState('SUCCESS');
      // Reset password fields after saving
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setSaveState('IDLE'), 2000); // Revert to idle
    }, 1500); // Simulate API call
  };

  const handleCancel = () => {
    // Reset all changes
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setProfilePic(null);
  };

  const openDeleteAllModal = () => {
    setModalProps({
      title: 'Delete All Analyses',
      message: 'Are you sure you want to delete all analyses? This action cannot be undone.',
      onConfirm: () => {
        console.log('Deleting all analyses...');
        setIsModalOpen(false);
        // Add your actual delete logic here
      },
    });
    setIsModalOpen(true);
  };

  const openDeleteAccountModal = () => {
    setModalProps({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? All your data will be permanently removed. This action is irreversible.',
      onConfirm: () => {
        console.log('Deleting account...');
        setIsModalOpen(false);
        // Add your actual delete logic here
      },
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {isModalOpen && (
        <ConfirmationModal
          {...modalProps}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
      
      <Sidebar />

      <main className="flex-1 p-6 flex flex-col h-full overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-500 mt-2">Manage your profile and preferences</p>
        </div>

        <form onSubmit={handleSave}>
          
          {/* 1. Profile Information Card */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>

            <div className="flex items-center mb-8">
              {profilePic ? (
                <img src={profilePic} alt="Profile Preview" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">AJ</div>
              )}
              <div className="ml-4">
                <span className="text-lg font-semibold text-gray-800">Anurag Jha</span>
                <span className="block text-sm text-gray-500">anurag@gmail.com</span>
                <button type="button" className="text-sm text-blue-600 hover:underline mt-1" onClick={handleChangePhotoClick}>
                  Change Profile Photo
                </button>
              </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/png, image/jpeg" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name (using placeholder) */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder:text-gray-400"
                  placeholder="Anurag Jha"
                />
              </div>

              {/* Email (using placeholder) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 placeholder:text-gray-400"
                  placeholder="anurag@gmail.com"
                />
              </div>

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative mt-1">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    id="currentPassword"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700"
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                  />
                  <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                    {showCurrentPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* New Password (COMMENTED OUT) */}
              {/*
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
                  />
                  <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                  </button>
                </div>
              </div>
              */}

              {/* Confirm Password (COMMENTED OUT) */}
              {/*
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
                  />
                  <button className="absolute inset-y-0 right-0 pr-3 flex items-center" type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                  </button>
                </div>
              </div>
              */}
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
                {saveState === 'IDLE' && 'Save Changes'}
                {saveState === 'SAVING' && 'Saving...'}
                {saveState === 'SUCCESS' && 'Saved!'}
              </button>
              <button 
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium" 
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg shadow p-8 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Management</h2>

            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Auto-delete analyses</h3>
                <p className="text-sm text-gray-500">Automatically remove analyses after 30 days</p>
              </div>
              <ToggleSwitch enabled={isAutoDeleteEnabled} onToggle={setIsAutoDeleteEnabled} />
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Storage Used</span>
                <span className="text-gray-500">2.4 GB / 10 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "24%" }}></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">127 analyses stored</span>
            </div>

            <button 
              type="button" 
              className="w-full py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium"
              onClick={openDeleteAllModal}
            >
              Delete All Analyses
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow p-8 mt-6 mb-4">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-700">Delete Account</h3>
              <p className="text-sm text-red-600 mt-1">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
              <button 
                type="button" 
                className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                onClick={openDeleteAccountModal}
              >
                Delete My Account
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}