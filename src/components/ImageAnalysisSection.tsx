"use client";
import React from "react";

import styles from "@/styles/ImageAnalysis.module.css";

interface Props {
  imageUrl: string;
  isDeepfake: boolean;
  confidenceScore: number;
  createdAt?: string;
}

const ImageAnalysisSection: React.FC<Props> = ({
  imageUrl,
  isDeepfake,
  confidenceScore,
  createdAt
}) => {
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true; // Prevent state updates if unmounted
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      try {
        // Fetch using the relative path (via Proxy) so cookies are sent
        const res = await fetch(imageUrl, { credentials: "include" });
        
        if (!res.ok) throw new Error("Failed to load image");

        const blob = await res.blob();
        
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setResolvedUrl(objectUrl);
        }
      } catch (err) {
        console.error("Image fetch failed:", err);
      }
    };

    if (imageUrl) {
        fetchImage();
    }

    // ✅ CLEANUP: Revoke the blob URL to prevent memory leaks
    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl]);

  return (
    <div className={styles.container}>

      {/* LEFT SIDE IMAGE */}
      <div className={styles.imageWrapper}>
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt="Analyzed"
            className={styles.image}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-slate-800 rounded-lg">
             <p className={styles.loadingText}>Loading secured image...</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE RESULT */}
      <div className={styles.resultWrapper}>
        <h2 className={styles.title}>Image Analysis</h2>

        <span
          className={`${styles.badge} ${isDeepfake ? styles.badgeFake : styles.badgeReal
            }`}
        >
          {isDeepfake ? "FAKE" : "REAL"}
        </span>

        <p className={styles.confidenceLabel}>Confidence</p>
        <p className={styles.confidenceValue}>
          {isDeepfake
            ? `${Math.round(confidenceScore * 100)}%`
            : `${Math.round((1 - confidenceScore) * 100)}%`}
        </p>

        {createdAt && (
            <p className={styles.dateLabel}>
            Analyzed on: {createdAt}
            </p>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisSection;