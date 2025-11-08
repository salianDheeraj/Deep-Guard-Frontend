// src/app/dashboard/page.tsx
"use client";

import React from 'react'; // Explicitly import React

import RecentAnalyses from '@/components/RecentAnalyses';
import DashboardStatCard from '@/components/DashboardStatCard';
import { Video, AlertTriangle, Clock } from 'lucide-react'; // Import icons for StatCard

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6">
        <DashboardStatCard/>
        <RecentAnalyses/>
      </div>
  );
}