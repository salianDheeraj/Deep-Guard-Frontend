// src/app/dashboard/history/page.tsx
"use client";

import React from 'react';

import AnalysisHistory from '@/components/AnalysisHistory'; // Import the main component

export default function HistoryPage() {
    return (
        <main className="flex-1 p-8 flex flex-col h-full max-w-7xl mx-auto">
                {/* Header matching the screenshot */}
                <div className="flex flex-col mb-6">
                    {/* Added dark:text-white so it's visible in dark mode */}
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Analysis History
                    </h1>
                    {/* Added dark:text-gray-400 */}
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Review and manage your past deepfake detection analyses
                    </p>
                </div>

                {/* Main content handled by AnalysisHistory component */}
                <AnalysisHistory /> 
            </main>
    );
}