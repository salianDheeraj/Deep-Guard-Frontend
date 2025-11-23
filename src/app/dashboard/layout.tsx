"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ✅ Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar />
      </div>

      {/* ✅ Main content with left margin to avoid overlap */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}