// src/app/dashboard/analysis/[id]/page.tsx
'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import AnalysisPage from '@/components/AnalysisPage';

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <AnalysisPage />
    </div>
  );
}
