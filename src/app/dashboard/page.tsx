"use client";

import React from 'react'; // Explicitly import React

// Use relative paths to match your project structure
import RecentAnalyses from '../../components/RecentAnalyses';
import DashboardStatCard from '../../components/DashboardStatCard';
// UserProfileCard import is no longer needed here
import { Video, AlertTriangle, Clock } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 space-y-6"> 
      
      {/* Stat Cards */}
      <div>
        <DashboardStatCard />
      </div>

      {/* Recent Analyses Table (takes full width) */}
      <div>
        <RecentAnalyses/>
      </div>

    </div>
  );
}