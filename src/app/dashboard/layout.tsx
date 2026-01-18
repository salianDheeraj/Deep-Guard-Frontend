import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // STICT AUTH CHECK (Server-Side)
  // This runs on the server before ANY UI is sent to the client.
  const cookieStore = await cookies();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  try {
    const res = await fetch(`${API_URL}/api/account/me`, {
      method: "GET",
      // Forward all cookies (accessToken, refreshToken) to the backend
      headers: { Cookie: cookieStore.toString() },
      cache: 'no-store' // Ensure we never cache this check
    });

    if (res.status === 401) {
      // If 401 Unauthorized, redirect IMMEDIATELY.
      redirect('/login');
    }
  } catch (error) {
    // FAIL CLOSED: If backend verification fails/errors, strictly redirect.
    redirect('/login');
  }

  return (
    // changed to h-screen and overflow-hidden to handle scrolling correctly
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">

      {/* ✅ SIDEBAR 
        We removed the 'fixed' wrapper here because the Sidebar component 
        now handles its own positioning (Fixed on Mobile, Relative on Desktop).
      */}
      <Sidebar />

      {/* ✅ MAIN CONTENT
        - flex-1: Takes remaining width on desktop (next to sidebar).
        - overflow-y-auto: Allows content to scroll independently.
        - ml-0: Removed the hardcoded ml-64 so it fits on mobile.
      */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden h-full">
        {/* ✅ CONTENT PADDING
          - pt-16: Adds top padding ONLY on mobile so the hamburger button doesn't block content.
          - md:pt-8: Resets to standard padding on desktop.
        */}
        <div className="w-full max-w-7xl mx-auto px-4 pt-16 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}