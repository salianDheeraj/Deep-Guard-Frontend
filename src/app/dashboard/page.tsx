// src/app/dashboard/page.tsx
"use client";

import React from 'react'; // Explicitly import React
import Sidebar from '@/components/Sidebar';
import RecentAnalyses from '@/components/RecentAnalyses';
import StatCard from '@/components/StatCard';
import { Video, AlertTriangle, Clock } from 'lucide-react'; // Import icons for StatCard

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Videos"
            value="1,234"
            description="Analyzed this month"
            Icon={Video} // Pass the Lucide icon component
            colorClass="bg-blue-500" // Example color
          />
          <StatCard
            title="Deepfakes Detected"
            value="78"
            description="Potential threats"
            Icon={AlertTriangle} // Pass the Lucide icon component
            colorClass="bg-red-500" // Example color
          />
          <StatCard
            title="Pending Review"
            value="12"
            description="Awaiting action"
            Icon={Clock} // Pass the Lucide icon component
            colorClass="bg-yellow-500" // Example color
          />
        </div>

        <RecentAnalyses />
      </div>
    </div>
  );
}