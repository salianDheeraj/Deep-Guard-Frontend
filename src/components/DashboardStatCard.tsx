"use client";

import React, { useEffect, useState, useRef } from "react";
import { Video, AlertTriangle } from "lucide-react";
import { useDashboardAnimations } from "@/hooks/useDashboardAnimations ";
import { apiFetch } from "@/lib/api";
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

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // -------- AUTHENTICATION CHECK (auto-refresh protected) --------
        const me = await apiFetch(`/api/account/me`);
        if (!me.ok) {
          setError("Not authenticated. Please login.");
          return;
        }

        // -------- FETCH ANALYSIS DATA (auto-refresh protected) --------
        const response = await apiFetch(`/api/analysis?limit=1000&offset=0`);
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

  // ---------------- RENDER: Loading ----------------
  if (loading) {
    return (
      <div className="text-gray-600 dark:text-gray-200 text-center py-10">
      <div
        className="text-gray-600 dark:text-gray-400 text-center py-10"
        role="status"
        aria-live="polite"
      >
        Loading stats...
      </div>
    );
  }

  // ---------------- RENDER: Error ----------------
  if (error) {
    return (
      <div className="text-red-600 dark:text-red-200 text-center py-10">
      <div
        className="text-red-600 dark:text-red-400 text-center py-10"
        role="alert"
      >
        {error}
      </div>
    );
  }

  // ---------------- RENDER: Success ----------------
  return (
    <div>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Total Videos */}
        <div className="stat-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            {/* Dark Mode: High Opacity Blue Background + White-Blue Icon */}
            <span className="rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/40 dark:text-blue-100 p-2 mr-3">
              <Video className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-white text-base">
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* TOTAL VIDEOS */}
        <section
          className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors"
          aria-labelledby="total-videos-title"
        >
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 mr-3">
              <Video className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="total-videos-title"
              className="font-semibold text-gray-700 dark:text-gray-400 text-base"
            >
              Total Videos
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-300 ml-4">
              Analyzed this month
            </span>
          </div>
        </section>

        {/* Real Videos */}
        <div className="stat-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            {/* Dark Mode: High Opacity Green Background + White-Green Icon */}
            <span className="rounded-full bg-green-100 text-green-600 dark:bg-green-500/40 dark:text-green-100 p-2 mr-3">
              <Video className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-white text-base">
        {/* REAL VIDEOS */}
        <section
          className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors"
          aria-labelledby="real-videos-title"
        >
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-2 mr-3">
              <Video className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="real-videos-title"
              className="font-semibold text-gray-700 dark:text-gray-400 text-base"
            >
              Real Videos
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.realVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-300 ml-4">
              Authentic content
            </span>
          </div>
        </section>

        {/* Fake Videos */}
        <div className="stat-card p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors">
          <div className="flex items-center mb-2">
            {/* Dark Mode: High Opacity Red Background + White-Red Icon */}
            <span className="rounded-full bg-red-100 text-red-600 dark:bg-red-500/40 dark:text-red-100 p-2 mr-3">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <span className="font-semibold text-gray-700 dark:text-white text-base">
        {/* FAKE VIDEOS */}
        <section
          className="stat-card p-6 bg-white dark:bg-slate-800 rounded-xl shadow border border-transparent dark:border-gray-700 flex flex-col transition-colors"
          aria-labelledby="fake-videos-title"
        >
          <div className="flex items-center mb-2">
            <span className="rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 mr-3">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="fake-videos-title"
              className="font-semibold text-gray-700 dark:text-gray-400 text-base"
            >
              Fake Videos
            </h3>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.fakeVideos}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-300 ml-4">
              Detected deepfakes
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}