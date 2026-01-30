// app/dashboard/layout.tsx
import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authentication is now safely handled by middleware.ts
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden h-full">
        <div className="w-full max-w-7xl mx-auto px-4 pt-16 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}