"use client";

import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Added router
import React, { useState, useEffect, useRef } from "react";
import { useRecentAnalysesAnimation } from "@/hooks/useRecentAnalysesAnimation";
import { apiFetch } from "@/lib/api";
import styles from "@/styles/Dashboard.module.css";

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
  const router = useRouter(); // ✅ Init router
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

      // ✅ Correct: Uses apiFetch with relative path -> Proxy -> Backend
      const res = await apiFetch("/api/analysis?limit=5&offset=0", {
        method: "GET",
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login"); // ✅ Smoother client-side redirect
          return;
        }
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
      <div className={`${styles.statusCard} p-4 md:p-6`}>
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium text-sm md:text-base">{error}</p>
            <button
              onClick={fetchAnalyses}
              className="text-xs md:text-sm text-red-500 hover:text-red-700 dark:hover:text-red-300 underline mt-1"
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
      <div className={`${styles.statusCard} p-6`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  // EMPTY STATE
  if (analyses.length === 0) {
    return (
      <div className={`${styles.statusCard} p-6`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No analyses yet. Start by uploading a video!
        </p>
      </div>
    );
  }

  // NORMAL RENDER
  return (
    <div
      ref={containerRef}
      className={`${styles.analysesCard} bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden`}
    >
      <h2 className={`${styles.cardHeader} text-lg md:text-xl font-bold p-4 md:p-6 border-b border-gray-100 dark:border-gray-800`}>
        Recent Analyses
      </h2>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {analyses.map((analysis) => (
          <Link
            href={`/dashboard/analysis/${analysis.id}`}
            key={analysis.id}
            // Responsive Layout: Compact padding on mobile
            className={`${styles.analysisRow} opacity-0 block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors p-3 md:p-4`}
          >
            <div className="flex items-center justify-between w-full">

              {/* LEFT: Avatar + Filename (Flexible width) */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Avatar */}
                <div
                  className={`${styles.avatar} w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base ${getAvatarPlaceholder(
                    analysis.filename
                  )}`}
                >
                  {analysis.filename.substring(0, 1).toUpperCase()}
                </div>

                {/* Text Info */}
                <div className="min-w-0 flex-1 pr-2">
                  {/* Truncate ensures filename doesn't push UI off screen */}
                  <p className={`${styles.filename} text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 truncate`}>
                    {analysis.filename}
                  </p>
                  <p className={`${styles.timestamp} text-xs text-gray-500`}>
                    {formatTimeAgo(analysis.created_at)}
                  </p>
                </div>
              </div>

              {/* RIGHT: Confidence + Badge + Arrow (Fixed/Shrink width) */}
              <div className="flex items-center gap-2 md:gap-4 shrink-0">

                {/* Confidence: HIDDEN on mobile to save space */}
                <span className={`${styles.confidence} text-sm text-gray-500 hidden sm:block`}>
                  {getDisplayedConfidence(analysis)}% confidence
                </span>

                {/* Status Badge */}
                <span
                  className={`${styles.statusBadge} px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${analysis.is_deepfake
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                >
                  {analysis.is_deepfake ? "FAKE" : "REAL"}
                </span>

                <ChevronRight className={`${styles.chevron} w-4 h-4 md:w-5 md:h-5 text-gray-400`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
        <Link
          href="/dashboard/history"
          className={`${styles.viewAllLink} block text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors`}
        >
          View All Analyses →
        </Link>
      </div>
    </div>
  );
}