// src/components/DeepfakeAlertCard.tsx - With inverted logic for REAL
'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
      className={`rounded-lg shadow-lg p-8 text-white ${
        isDeepfake
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : 'bg-gradient-to-r from-green-500 to-green-600'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left: Status & Message */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {isDeepfake ? (
              <>
                <AlertTriangle className="w-8 h-8" />
                <h2 className="text-4xl font-bold">FAKE</h2>
              </>
            ) : (
              <>
                <CheckCircle className="w-8 h-8" />
                <h2 className="text-4xl font-bold">REAL</h2>
              </>
            )}
          </div>
          
          <p className="text-lg font-semibold mb-1">
            {isDeepfake
              ? 'Deepfake manipulation detected'
              : 'No deepfake detected'}
          </p>
          
          <p className="text-sm opacity-90">
            Confidence represents model certainty, not absolute proof
          </p>
        </div>

        {/* Right: Confidence Score */}
        <div className="text-right">
          <p className="text-sm font-semibold opacity-80 mb-1">Overall Confidence</p>
          <p className="text-6xl font-bold">{displayPercentage}%</p>
        </div>
      </div>

      {/* Frame Analysis Info */}
      <div className="mt-6 pt-6 border-t border-white border-opacity-30 flex gap-6">
        <div>
          <p className="text-sm opacity-80">Frames Analyzed</p>
          <p className="text-2xl font-bold">{framesAnalyzed}</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Total Frames</p>
          <p className="text-2xl font-bold">{totalFrames}</p>
        </div>
        <div>
          <p className="text-sm opacity-80">Coverage</p>
          <p className="text-2xl font-bold">
            {totalFrames > 0 ? Math.round((framesAnalyzed / totalFrames) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeAlertCard;
