// src/app/dashboard/history/page.tsx
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar'; 

// --- Types and Mock Data ---
type Verdict = "FAKE" | "REAL";
type SortKey = "date" | "confidence"; // 1. Added type for sorting

interface AnalysisItem {
  id: string;
  date: string;
  fileName: string;
  verdict: Verdict;
  confidence: number;
  href: string; 
}

const mockAnalyses: AnalysisItem[] = [
  { id: '1', date: 'Dec 15, 2024', fileName: 'interview_clip.mp4', verdict: 'FAKE', confidence: 78, href: '/dashboard/analysis/1' },
  { id: '2', date: 'Dec 15, 2024', fileName: 'press_conference.mp4', verdict: 'REAL', confidence: 94, href: '/dashboard/analysis/2' },
  { id: '3', date: 'Dec 14, 2024', fileName: 'social_media_frames.zip', verdict: 'FAKE', confidence: 89, href: '/dashboard/analysis/3' },
  { id: '4', date: 'Dec 13, 2024', fileName: 'profile_photo.jpg', verdict: 'REAL', confidence: 91, href: '/dashboard/analysis/4' },
  { id: '5', date: 'Dec 12, 2024', fileName: 'news_segment.mp4', verdict: 'FAKE', confidence: 85, href: '/dashboard/analysis/5' },
];
// --- ---

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('date'); // 2. Added state for sorting

  // 3. This logic now FILTERS and SORTS
  const filteredAndSortedAnalyses = useMemo(() => {
    let processedData = [...mockAnalyses];

    // Step A: Filter
    if (activeFilter !== 'All') {
      processedData = processedData.filter(item => item.verdict === activeFilter);
    }
    
    // Step B: Sort
    processedData.sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidence - a.confidence; // Highest confidence first
      }
      // Default: Sort by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return processedData;
  }, [activeFilter, sortBy]); // Re-runs when filter or sort changes

  // "Select All" logic now uses the filtered and sorted list
  const allVisibleIds = filteredAndSortedAnalyses.map(item => item.id);
  const areAllSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIds.includes(id));

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(allVisibleIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100"> 
      <Sidebar /> 

      <main className="flex-1 p-6 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Analysis History</h1>
          <p className="text-gray-500 mt-2">Review and manage your past deepfake detection analyses</p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-between items-center">
          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {['All', 'FAKE', 'REAL'].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setSelectedIds([]); // Clear selection
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    activeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by filename..."
                className="pl-10 pr-4 py-2.5 w-48 border border-gray-300 rounded-md text-sm bg-white font-semibold text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            {/* 4. SORTING DROPDOWN (Now functional) */}
            <div className="relative">
              <select 
                className="appearance-none pr-10 pl-4 py-2.5 w-48 border border-gray-300 rounded-md text-sm bg-white font-semibold text-black focus:outline-none focus:ring-2 focus:ring-black-400"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
              >
                <option value="date">Sort by Date</option>
                <option value="confidence">Sort by Confidence</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Analysis Table */}
        <div className="bg-white rounded-lg shadow mt-6 flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={areAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">File Name</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Verdict</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Confidence</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* 5. Use the new 'filteredAndSortedAnalyses' list */}
              {filteredAndSortedAnalyses.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-800 font-medium flex items-center">
                    <FileText size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                    {item.fileName}
                  </td>
                  <td className="p-4 text-sm text-gray-700">{item.date}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        item.verdict === 'FAKE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.verdict}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-800 font-medium">{item.confidence}%</td>
                  <td className="p-4 text-sm font-medium">
                    <Link href={item.href} className="text-blue-600 hover:underline">View</Link>
                    <button className="text-red-600 hover:underline ml-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Table Footer (Pagination) */}
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-gray-600">Showing {filteredAndSortedAnalyses.length} of {mockAnalyses.length} analyses</span>
            <nav className="flex items-center space-x-1">
              <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Previous
              </button>
              <button className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white">1</button>
              <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100">2</button>
              <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100">3</button>
              <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center">
                Next <ChevronRight size={16} className="ml-1" />
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-6">
          <button 
            className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${selectedIds.length > 0 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
            disabled={selectedIds.length === 0}
          >
            Bulk Delete Selected ({selectedIds.length})
          </button>
          <Link 
            href="/dashboard/new-analysis"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Start New Analysis
          </Link>
        </div>
      </main>
    </div>
  );
}