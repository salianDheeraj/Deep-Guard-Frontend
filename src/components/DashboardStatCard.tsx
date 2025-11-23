"use client";

import React, { useEffect, useState, useRef } from "react";
import { Video, AlertTriangle } from "lucide-react";
import { useDashboardAnimations } from "@/hooks/useDashboardAnimations ";
import { useRouter } from "next/navigation";

interface StatsData {
  totalVideos: number;
  realVideos: number;
  fakeVideos: number;
}

export default function DashboardStatCard() {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<StatsData>({
    totalVideos: 0,
    realVideos: 0,
    fakeVideos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDashboardAnimations(gridRef);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // Auth check
        const me = await fetch(`${API_URL}/api/account/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!me.ok) {
          setError("Not authenticated. Please login.");
          return;
        }

        // Fetch analysis list
        const response = await fetch(
          `${API_URL}/api/analysis?limit=1000&offset=0`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch analyses: HTTP ${response.status}`);
        }

        const result = await response.json();
        const analyses = result.data || [];

        const totalVideos = analyses.length;
        const realVideos = analyses.filter((a: any) => !a.is_deepfake).length;
        const fakeVideos = totalVideos - realVideos;

        setStats({ totalVideos, realVideos, fakeVideos });
      } catch (err: any) {
        setError(err.message || "Error fetching stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // LOADING STATE
  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-400 text-center py-10">
        Loading stats...
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-center py-10">
        {error}
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Total Videos */}
        <div className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 mr-3">
              <Video className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-400 text-base">
              Total Videos
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-4">
              Analyzed this month
            </span>
          </div>
        </div>

        {/* Real Videos */}
        <div className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 mr-3">
              <Video className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-400 text-base">
              Real Videos
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.realVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-4">
              Authentic content
            </span>
          </div>
        </div>

        {/* Fake Videos */}
        <div className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 mr-3">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-gray-400 text-base">
              Fake Videos
            </span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.fakeVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-4">
              Detected deepfakes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
