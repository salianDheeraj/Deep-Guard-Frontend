"use client";

import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRecentAnalysesAnimation } from "@/hooks/useRecentAnalysesAnimation";
import { apiFetch } from "@/lib/api";

interface Analysis {
  id: string;
  filename: string;
  is_deepfake: boolean;
  confidence_score: number;
  status: string;
  created_at: string;
}

const getAvatarPlaceholder = (name: string) => {
  const colors = [
    "bg-pink-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-yellow-400",
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const getDisplayedConfidence = (analysis: Analysis) => {
  return analysis.is_deepfake
    ? Math.round(analysis.confidence_score * 100)
    : Math.round((1 - analysis.confidence_score) * 100);
};

export default function RecentAnalyses() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRecentAnalysesAnimation(containerRef);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiFetch("/api/analysis?limit=5&offset=0", {
        method: "GET",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      const result = await res.json();
      setAnalyses(result.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching analyses:", err);
      setError(err.message || "Failed to load recent analyses");
    } finally {
      setLoading(false);
    }
  };

  // ERROR STATE
  if (error) {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center space-x-3 text-red-600 dark:text-orange-400">
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchAnalyses}
              className="text-sm text-red-500 hover:text-red-700 dark:text-orange-400 dark:hover:text-orange-300 mt-1 underline"
              className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-300 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 flex items-center justify-center h-40 border border-gray-100 dark:border-gray-700 transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-teal-400" />
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 flex items-center justify-center h-40 border border-gray-100 dark:border-gray-700">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  // EMPTY STATE
  if (analyses.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-slate-800 shadow-md p-6 text-center border border-gray-100 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No analyses yet. Start by uploading a video!
        </p>
      </div>
    );
  }

  // NORMAL RENDER
  return (
    <div
      ref={containerRef}
      className="rounded-xl bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-gray-700"
    >
      <h2 className="text-xl font-bold p-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-white">
        Recent Analyses
      </h2>

      {analyses.map((analysis) => (
        <Link
          href={`/dashboard/analysis/${analysis.id}`}
          key={analysis.id}
          className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
        >
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarPlaceholder(
                analysis.filename
              )}`}
            >
              {analysis.filename.substring(0, 1).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {analysis.filename}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatTimeAgo(analysis.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {getDisplayedConfidence(analysis)}% confidence
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase whitespace-nowrap ${
                analysis.is_deepfake
                  // CHANGED: Red -> Orange for FAKE
                  ? "bg-red-100 text-red-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              {analysis.is_deepfake ? "FAKE" : "REAL"}
            </span>

            <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </div>
        </Link>
      ))}

      <div className="p-4 text-center border-t border-gray-100 dark:border-gray-700">
        <Link
          href="/dashboard/history"
          // CHANGED: Blue -> Teal in Dark Mode
          className="text-sm font-medium text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-300 transition-colors"
        >
          View All Analyses →
        </Link>
      </div>
    </div>
  );
}