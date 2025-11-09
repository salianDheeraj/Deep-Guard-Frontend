// src/app/dashboard/page.tsx
"use client";

import React, { useRef } from 'react';
import RecentAnalyses from '@/components/RecentAnalyses';
import StatCard from '@/components/StatCard'; // Make sure this is a default import
import { Video, AlertTriangle, Clock } from 'lucide-react'; 

// 1. Import your new custom hook HERE
import { useDashboardAnimations } from '@/hooks/useDashboardAnimations';

export default function DashboardPage() {
  const container = useRef(null); // The scope for the animations

  // 2. Call your hook here
  useDashboardAnimations(container);

  return (
    // 3. The container ref scopes the animations
    <div ref={container}> 
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        
        <div className="stat-card">
          <StatCard 
            title="Total Videos"
            value="1,234"
            description="Analyzed this month"
            Icon={Video}
            colorClass="bg-blue-500"
          />
        </div>
        
        <div className="stat-card">
          <StatCard 
            title="Deepfakes Detected"
            value="78"
            description="Potential threats"
            Icon={AlertTriangle}
            colorClass="bg-red-500"
          />
        </div>
        
        <div className="stat-card">
          <StatCard 
            title="Pending Review"
            value="12"
            description="Awaiting action"
            Icon={Clock}
            colorClass="bg-yellow-500"
          />
        </div>
        
      </div>

      <RecentAnalyses />
    </div>
  );
}