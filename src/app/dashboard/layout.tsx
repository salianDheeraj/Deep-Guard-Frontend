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
    // This prevents the UI from rendering if we can't confirm identity.
    redirect('/login');
  }

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