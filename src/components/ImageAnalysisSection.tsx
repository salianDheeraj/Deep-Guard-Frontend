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
  // Convert backend binary response → Blob → URL
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(imageUrl, { credentials: "include" });
        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        setResolvedUrl(localUrl);
      } catch (err) {
        console.error("Image fetch failed:", err);
      }
    };

    fetchImage();
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
          <p className={styles.loadingText}>Loading image...</p>
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
          {Math.round(confidenceScore * 100)}%
        </p>

        <p className={styles.dateLabel}>
          Analyzed on: {createdAt}
        </p>
      </div>
    </div>
  );
};

export default ImageAnalysisSection;
