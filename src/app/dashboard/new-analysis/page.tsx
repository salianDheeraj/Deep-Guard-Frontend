import NewAnalysisContent from '@/components/NewAnalysisContent';
import React, { Suspense } from 'react';

export default function NewAnalysisPage() {
  return (
    // ✅ FIX: Wrapped in Suspense to handle useSearchParams() during build
    <Suspense fallback={<div className="flex justify-center p-8">Loading analysis...</div>}>
      <NewAnalysisContent />
    </Suspense>
  );
}