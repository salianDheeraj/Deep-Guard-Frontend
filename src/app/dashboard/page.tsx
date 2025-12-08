"use client";

import React from 'react';
import RecentAnalyses from '../../components/RecentAnalyses';
import DashboardStatCard from '../../components/DashboardStatCard';
import DashboardWelcome from '../../components/DashboardWelcome';
import DashboardQuickActions from '../../components/DashboardQuickActions';
import DidYouKnowCard from '../../components/DidYouKnowCard';

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 space-y-8 max-w-[1600px] mx-auto w-full">

      {/* 1. Welcome Header */}
      <DashboardWelcome />

      {/* 2. Top Row: Quick Actions & Random Fact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardQuickActions />
        </div>
        <div className="h-full">
          <DidYouKnowCard />
        </div>
      </div>

      {/* 3. Middle: Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-1">Overview</h2>
        <DashboardStatCard />
      </div>

      {/* 4. Bottom: Recent Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-1">Recent Analysis</h2>
        <RecentAnalyses />
      </div>

    </div>
  );
}