// src/components/DeepfakeAlertCard.tsx - With inverted logic for REAL
'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import styles from '@/styles/Analysis.module.css';

interface DeepfakeAlertCardProps {
  isDeepfake: boolean;
  confidence: number;
  framesAnalyzed: number;
  totalFrames: number;
}

const DeepfakeAlertCard: React.FC<DeepfakeAlertCardProps> = ({
  isDeepfake,
  confidence,
  framesAnalyzed,
  totalFrames
}) => {
  // ✅ Apply inverted logic for REAL videos
  const displayConfidence = isDeepfake
    ? confidence
    : (1 - confidence);

  const displayPercentage = Math.round(displayConfidence * 100);

  return (
    <div
      className={`${styles.alertCard} ${isDeepfake
          ? styles.fakeGradient
          : styles.realGradient
        }`}
    >
      <div className={styles.alertHeader}>
        {/* Left: Status & Message */}
        <div className="flex-1">
          <div className={styles.alertStatus}>
            {isDeepfake ? (
              <>
                <AlertTriangle className={styles.statusIcon} />
                <h2 className={styles.statusText}>FAKE</h2>
              </>
            ) : (
              <>
                <CheckCircle className={styles.statusIcon} />
                <h2 className={styles.statusText}>REAL</h2>
              </>
            )}
          </div>

          <p className={styles.alertMessage}>
            {isDeepfake
              ? 'Deepfake manipulation detected'
              : 'No deepfake detected'}
          </p>

          <p className={styles.alertSubMessage}>
            Confidence represents model certainty, not absolute proof
          </p>
        </div>

        {/* Right: Confidence Score */}
        <div className={styles.confidenceSection}>
          <p className={styles.confidenceLabel}>Overall Confidence</p>
          <p className={styles.confidenceValue}>{displayPercentage}%</p>
        </div>
      </div>

      {/* Frame Analysis Info */}
      <div className={styles.statsRow}>
        <div>
          <p className={styles.statItemLabel}>Frames Analyzed</p>
          <p className={styles.statItemValue}>{framesAnalyzed}</p>
        </div>
        <div>
          <p className={styles.statItemLabel}>Total Frames</p>
          <p className={styles.statItemValue}>{totalFrames}</p>
        </div>
        <div>
          <p className={styles.statItemLabel}>Coverage</p>
          <p className={styles.statItemValue}>
            {totalFrames > 0 ? Math.round((framesAnalyzed / totalFrames) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeAlertCard;
