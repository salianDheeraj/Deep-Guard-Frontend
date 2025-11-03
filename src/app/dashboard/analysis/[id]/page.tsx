// src/app/analysis/[id]/page.tsx
"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar'; 
import AnalysisHeader from '@/components/AnalysisHeader';
import DeepfakeAlertCard from '@/components/DeepfakeAlertCard';
import FrameAnalysisSection from '@/components/FrameAnalysisSection';
import ConfidenceOverTimeChart from '@/components/ConfidenceOverTimeChart';
import UnderstandingConfidence from '@/components/UnderstandingConfidence';

// Define the type for a single frame to satisfy TypeScript
interface Frame {
  id: number;
  label: "FAKE" | "REAL";
  confidence: number;
  imageUrl: string;
}

export default function AnalysisResultsPage() {
  const analysisData = {
    fileName: "interview_clip.mp4",
    analyzedDate: "Dec 15, 2024",
    modelVersion: "V3.2",
    overallConfidence: 78,
    isDeepfake: true,
    // Add 'as Frame[]' to tell TypeScript these strings are the correct literal types
    frames: [
      { id: 1, label: "FAKE", confidence: 82, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+1" },
      { id: 2, label: "FAKE", confidence: 78, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+2" },
      { id: 3, label: "FAKE", confidence: 76, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+3" },
      { id: 4, label: "REAL", confidence: 68, imageUrl: "https://via.placeholder.com/100x75/4CAF50/FFFFFF?text=Frame+4" },
      { id: 5, label: "FAKE", confidence: 81, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+5" },
      { id: 6, label: "FAKE", confidence: 77, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+6" },
      { id: 7, label: "FAKE", confidence: 84, imageUrl: "https://via.placeholder.com/100x75/E04444/FFFFFF?text=Frame+7" },
      { id: 8, label: "REAL", confidence: 71, imageUrl: "https://via.placeholder.com/100x75/4CAF50/FFFFFF?text=Frame+8" },
    ] as Frame[], // <-- This is the fix
    totalFrames: 120,
    showingFrames: 8,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        <AnalysisHeader
          fileName={analysisData.fileName}
          analyzedDate={analysisData.analyzedDate}
          modelVersion={analysisData.modelVersion}
        />

        <DeepfakeAlertCard
          isDeepfake={analysisData.isDeepfake}
          confidence={analysisData.overallConfidence}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FrameAnalysisSection
            frames={analysisData.frames}
            totalFrames={analysisData.totalFrames}
            showingFrames={analysisData.showingFrames}
          />
          <ConfidenceOverTimeChart />
        </div>

        <UnderstandingConfidence />
      </div>
    </div>
  );
}