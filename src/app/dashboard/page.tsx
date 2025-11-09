// src/app/dashboard/page.tsx
"use client";

import React, { useRef } from 'react';
import { useDashboardAnimations } from '@/hooks/useDashboardAnimations';

// Import your components
import RecentAnalyses from '@/components/RecentAnalyses';
import DashboardStatCard from '@/components/DashboardStatCard';

export default function DashboardPage() {
  const container = useRef<HTMLDivElement>(null); // Ref for the main page container

  useDashboardAnimations(container); // Pass the ref to your animation hook

  return (
    <div ref={container}> {/* Apply the ref here */}
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* The DashboardStatCard component renders the grid of cards itself.
          We apply the "stat-card" class to its *container* for the animation.
          The animation hook targets children of the scoped element with ".stat-card".
          So, if DashboardStatCard's root is a div for the grid, apply stat-card there.
      */}
      {/* Assuming DashboardStatCard's root element is what you want to animate as a "stat-card" group */}
      <DashboardStatCard /> {/* This component will likely render its own grid with the cards */}

      {/* Recent Analyses will fade in after */}
      <div className="recent-analyses mt-6">
        <RecentAnalyses />
      </div>
      
    </div>
  );
}
