// src/app/dashboard/history/page.tsx (New Wrapper Structure)
"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar'; 
import AnalysisHistory from '@/components/AnalysisHistory'; // Import the main component

export default function HistoryPage() {
    return (
        // The structure now combines the Sidebar and the main content area
        <div className="flex min-h-screen bg-gray-50"> 
            <Sidebar /> 
            
            <main className="flex-1 p-8 flex flex-col h-full max-w-7xl mx-auto">
                {/* Header matching the screenshot */}
                <div className="flex flex-col mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Analysis History</h1>
                    <p className="text-gray-500 mt-2">Review and manage your past deepfake detection analyses</p>
                </div>

                {/* Main content handled by AnalysisHistory component */}
                <AnalysisHistory /> 
            </main>
        </div>
    );
}