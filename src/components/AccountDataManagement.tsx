// src/app/dashboard/components/AccountDataManagement.tsx
"use client";

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

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

export default function AccountDataManagement() {
  const [isAutoDeleteEnabled, setIsAutoDeleteEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<Omit<ModalProps, 'onCancel'>>({
    title: '',
    message: '',
    onConfirm: () => {},
  });
const token = localStorage.getItem('authToken');

const openDeleteAllModal = () => {
  setModalProps({
    title: 'Delete All Analyses',
    message: 'Are you sure you want to delete all analyses? This action cannot be undone.',
    onConfirm: async () => {
      try {
        await fetch('/api/account/delete-analyses', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Deleting all analyses...');
        setIsModalOpen(false);
        alert('All analyses deleted successfully!');
      } catch (error) {
        console.error('Failed to delete analyses:', error);
        alert('Failed to delete analyses. Please try again.');
      }
    },
  });
  setIsModalOpen(true);
};

const openDeleteAccountModal = () => {
  setModalProps({
    title: 'Delete Account',
    message: 'Are you sure you want to delete your account? All your data will be permanently removed. This action is irreversible.',
    onConfirm: async () => {
      try {
        await fetch('/api/account/delete-account', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Deleting account...');
        setIsModalOpen(false);
        window.location.href = '/';
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    },
  });
  setIsModalOpen(true);
};


  return (
    <>
      {isModalOpen && (
        <ConfirmationModal
          {...modalProps}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

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
    </>
  );
}
