"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setAuthenticated(true);
      } catch {
        router.replace("/login");
      }
    }

    checkAuth();
  }, []);

  // While checking auth → don't show layout
  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-300">
        Checking authentication…
      </div>
    );
  }

  // Auth OK → render layout
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="fixed left-0 top-0 h-screen z-50">
        <Sidebar />
      </div>

      <div className="flex-1 ml-64">{children}</div>
    </div>
  );
}
