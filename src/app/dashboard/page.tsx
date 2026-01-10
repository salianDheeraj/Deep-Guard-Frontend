"use client";

import React from 'react';
import RecentAnalyses from '../../components/RecentAnalyses';
import DashboardStatCard from '../../components/DashboardStatCard';
import DashboardWelcome from '../../components/DashboardWelcome';
import DashboardQuickActions from '../../components/DashboardQuickActions';
import DidYouKnowCard from '../../components/DidYouKnowCard';

export default function DashboardPage() {
  return (
    /* Responsive Container:
      - Removed 'p-6' (Layout handles padding now).
      - space-y-6 on mobile (tighter), space-y-8 on desktop (spacious).
    */
    <div className="flex-1 space-y-6 md:space-y-8 max-w-[1600px] mx-auto w-full">

      {/* 1. Welcome Header */}
      <section>
        <DashboardWelcome />
      </section>

      {/* 2. Top Row: Quick Actions & Random Fact 
          - Mobile: grid-cols-1 (Stacked vertically)
          - Desktop (lg): grid-cols-3 (Quick Actions takes 2/3, Fact takes 1/3)
      */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-full">
          <DashboardQuickActions />
        </div>
        <div className="h-full min-h-[180px]"> 
          <DidYouKnowCard />
        </div>
      </section>

      {/* 3. Middle: Stats */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4 px-1">
          Overview
        </h2>
        <DashboardStatCard />
      </section>

      {/* 4. Bottom: Recent Table */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4 px-1">
          Recent Analysis
        </h2>
        <RecentAnalyses />
      </section>

    </div>
  );
}