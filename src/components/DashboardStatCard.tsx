"use client";

import React, { useEffect, useState, useRef } from "react";
import { Video, AlertTriangle } from "lucide-react";
import { useDashboardAnimations } from "@/hooks/useDashboardAnimations ";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import styles from "@/styles/Dashboard.module.css";

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
          if (me.status === 401) {
            router.push('/login');
            return;
          }
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
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* TOTAL VIDEOS */}
        <section
          className={`${styles.statCard} stat-card opacity-0`}
          aria-labelledby="total-videos-title"
        >
          <div className={styles.statHeader}>
            <span className={`${styles.statIconWrapper} ${styles.iconWrapperBlue}`}>
              <Video className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="total-videos-title"
              className={styles.statTitle}
            >
              Total Videos
            </h3>
          </div>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {stats.totalVideos}
            </span>
            <span className={styles.statLabel}>
              Analyzed this month
            </span>
          </div>
        </section>

        {/* REAL VIDEOS */}
        <section
          className={`${styles.statCard} stat-card opacity-0`}
          aria-labelledby="real-videos-title"
        >
          <div className={styles.statHeader}>
            <span className={`${styles.statIconWrapper} ${styles.iconWrapperGreen}`}>
              <Video className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="real-videos-title"
              className={styles.statTitle}
            >
              Real Videos
            </h3>
          </div>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {stats.realVideos}
            </span>
            <span className={styles.statLabel}>
              Authentic content
            </span>
          </div>
        </section>

        {/* FAKE VIDEOS */}
        <section
          className={`${styles.statCard} stat-card opacity-0`}
          aria-labelledby="fake-videos-title"
        >
          <div className={styles.statHeader}>
            <span className={`${styles.statIconWrapper} ${styles.iconWrapperRed}`}>
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </span>
            <h3
              id="fake-videos-title"
              className={styles.statTitle}
            >
              Fake Videos
            </h3>
          </div>
          <div className={styles.statValueRow}>
            <span className={styles.statValue}>
              {stats.fakeVideos}
            </span>
            <span className={styles.statLabel}>
              Detected deepfakes
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
