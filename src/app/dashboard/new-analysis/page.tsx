import Sidebar from '@/components/Sidebar'; 
import NewAnalysisContent from '@/components/NewAnalysisContent'; // Corrected import path
import React from 'react';

export default function NewAnalysisPage() {
  return (
    <div className="flex min-h-screen bg-gray-50"> 
      
      {/* 1. Sidebar Component */}
      <Sidebar /> 
      
      {/* 2. Main Content Component */}
      <NewAnalysisContent /> 
      
    </div>
  );
}