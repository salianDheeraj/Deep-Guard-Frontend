"use client";

import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
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
      <div className={styles.statusCard}>
        <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchAnalyses}
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
      <div className={styles.statusCard}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  // EMPTY STATE
  if (analyses.length === 0) {
    return (
      <div className={styles.statusCard}>
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
      className={styles.analysesCard}
    >
      <h2 className={styles.cardHeader}>
        Recent Analyses
      </h2>

      {analyses.map((analysis) => (
        <Link
          href={`/dashboard/analysis/${analysis.id}`}
          key={analysis.id}
          className={`${styles.analysisRow} opacity-0`}
        >
          <div className={styles.leftContent}>
            <div
              className={`${styles.avatar} ${getAvatarPlaceholder(
                analysis.filename
              )}`}
            >
              {analysis.filename.substring(0, 1).toUpperCase()}
            </div>

            <div className={styles.textContent}>
              <p className={styles.filename}>
                {analysis.filename}
              </p>
              <p className={styles.timestamp}>
                {formatTimeAgo(analysis.created_at)}
              </p>
            </div>
          </div>

          <div className={styles.rightContent}>
            <span className={styles.confidence}>
              {getDisplayedConfidence(analysis)}% confidence
            </span>

            <span
              className={`${styles.statusBadge} ${analysis.is_deepfake
                ? styles.badgeFake
                : styles.badgeReal
                }`}
            >
              {analysis.is_deepfake ? "FAKE" : "REAL"}
            </span>

            <ChevronRight className={styles.chevron} />
          </div>
        </Link>
      ))}

      <div className={styles.viewAllLinkContainer}>
        <Link
          href="/dashboard/history"
          className={styles.viewAllLink}
        >
          View All Analyses →
        </Link>
      </div>
    </div>
  );
}
