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
      {/* Responsive Header:
        - Mobile: flex-col (stacks status top, confidence bottom)
        - Desktop (sm): flex-row (side-by-side)
      */}
      <div className={`${styles.alertHeader} flex flex-col sm:flex-row gap-6 sm:gap-4`}>

        {/* Left: Status & Message */}
        <div className="flex-1">
          <div className={`${styles.alertStatus} flex items-center gap-3 mb-2`}>
            {isDeepfake ? (
              <>
                <AlertTriangle className={`${styles.statusIcon} w-6 h-6 sm:w-8 sm:h-8`} />
                <h2 className={`${styles.statusText} text-2xl sm:text-3xl font-bold`}>FAKE</h2>
              </>
            ) : (
              <>
                <CheckCircle className={`${styles.statusIcon} w-6 h-6 sm:w-8 sm:h-8`} />
                <h2 className={`${styles.statusText} text-2xl sm:text-3xl font-bold`}>REAL</h2>
              </>
            )}
          </div>

          <p className={`${styles.alertMessage} text-lg sm:text-xl font-medium mb-1`}>
            {isDeepfake
              ? 'Deepfake manipulation detected'
              : 'No deepfake detected'}
          </p>

          <p className={`${styles.alertSubMessage} text-sm opacity-90`}>
            Confidence represents model certainty, not absolute proof
          </p>
        </div>

        {/* Right: Confidence Score */}
        {/* Mobile: Aligns left (default), Desktop: Aligns right (text-right) */}
        <div className={`${styles.confidenceSection} sm:text-right flex flex-col justify-center sm:block border-t sm:border-t-0 border-white/20 pt-4 sm:pt-0`}>
          <p className={`${styles.confidenceLabel} text-sm uppercase tracking-wider opacity-90 mb-1`}>
            Overall Confidence
          </p>
          {/* Responsive Text Size: 3xl on mobile, 5xl on desktop */}
          <p className={`${styles.confidenceValue} text-4xl sm:text-5xl font-bold`}>
            {displayPercentage}%
          </p>
        </div>
      </div>

      {/* Frame Analysis Info */}
      {/* Grid ensures even spacing on mobile without wrapping awkwardly */}
      {/* Frame Analysis Info */}
      <div className={`${styles.statsRow} flex flex-wrap justify-between items-center px-1`}>
        <div className="text-center sm:text-left flex-1 min-w-[30%]">
          <p className={`${styles.statItemLabel} text-[10px] sm:text-sm uppercase tracking-wide opacity-80 mb-1`}>
            Analyzed
          </p>
          <p className={`${styles.statItemValue} text-base sm:text-xl font-semibold`}>
            {framesAnalyzed}
          </p>
        </div>
        <div className="text-center sm:text-left flex-1 min-w-[30%]">
          <p className={`${styles.statItemLabel} text-[10px] sm:text-sm uppercase tracking-wide opacity-80 mb-1`}>
            Total Frames
          </p>
          <p className={`${styles.statItemValue} text-base sm:text-xl font-semibold`}>
            {totalFrames}
          </p>
        </div>
        <div className="text-center sm:text-left flex-1 min-w-[30%]">
          <p className={`${styles.statItemLabel} text-[10px] sm:text-sm uppercase tracking-wide opacity-80 mb-1`}>
            Coverage
          </p>
          <p className={`${styles.statItemValue} text-base sm:text-xl font-semibold`}>
            {totalFrames > 0 ? Math.round((framesAnalyzed / totalFrames) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeAlertCard;