// src/app/components/RecentAnalyses.tsx
"use client";

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const recentData = [
  {
    id: 1,
    fileName: 'interview_clip.mp4',
    timeAgo: '2 hours ago',
    result: 'FAKE',
    confidence: '78%',
    statusColor: 'bg-red-100 text-red-700',
  },
  {
    id: 2,
    fileName: 'press_conference.mp4',
    timeAgo: '5 hours ago',
    result: 'REAL',
    confidence: '94%',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    id: 3,
    fileName: 'social_media_frames.zip',
    timeAgo: '1 day ago',
    result: 'FAKE',
    confidence: '89%',
    statusColor: 'bg-red-100 text-red-700',
  },
];

const getAvatarPlaceholder = (name: string) => {
    const colors = ['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400'];
    const index = name.length % colors.length;
    return colors[index];
}

export default function RecentAnalyses() {
  return (
    <div className="rounded-xl bg-white shadow-md">
      <h2 className="text-xl font-bold p-4 border-b text-gray-800">Recent Analyses</h2>
      {recentData.map((analysis) => (
        <Link
          href={`/dashboard/analysis/${analysis.id}`}
          key={analysis.id}
          className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 border-b last:border-b-0"
        >
          <div className="flex items-center space-x-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarPlaceholder(analysis.fileName)}`}>
              {analysis.fileName.substring(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{analysis.fileName}</p>
              <p className="text-sm text-gray-500">{analysis.timeAgo}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden text-sm text-gray-500 md:block">
              {analysis.confidence} confidence
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${analysis.statusColor}`}
            >
              {analysis.result}
            </span>

            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>
      ))}
      <div className="p-4 text-center">
        <Link href="/dashboard/history" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View All Analyses →
        </Link>
      </div>
    </div>
  );
}