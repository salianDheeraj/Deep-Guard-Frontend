"use client";


import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useRecentAnalysesAnimation } from '@/hooks/useRecentAnalysesAnimation'; 


interface Analysis {
  id: string;
  filename: string;
  is_deepfake: boolean;
  confidence_score: number;
  status: string;
  created_at: string;
}


const getAvatarPlaceholder = (name: string) => {
  const colors = ['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400'];
  const index = name.length % colors.length;
  return colors[index];
};


const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);


  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};


const getDisplayedConfidence = (analysis: Analysis) => {
  if (analysis.is_deepfake) {
    return Math.round(analysis.confidence_score * 100);
  } else {
    return Math.round((1 - analysis.confidence_score) * 100);
  }
};

export default function RecentAnalyses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useRecentAnalysesAnimation(containerRef);


  useEffect(() => {
    fetchAnalyses();
  }, []);

const fetchAnalyses = async () => {
  try {
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // 1️⃣ Check session first
    const me = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });

    if (me.status === 401) {
      setError('Not authenticated. Please login.');
      setLoading(false);
      return;
    }

    // OPTIONAL: auto refresh if expired
    if (!me.ok) {
      const refresh = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refresh.ok) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }
    }

    // 2️⃣ Now fetch actual analyses
    const response = await fetch(`${API_URL}/api/analysis?limit=5&offset=0`, {
      method: 'GET',
      credentials: 'include',   // ⭐ Cookie-based auth
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    setAnalyses(result.data || []);

  } catch (err: any) {
    console.error('❌ Error fetching analyses:', err);
    setError(err.message || 'Failed to load recent analyses');
  } finally {
    setLoading(false);
  }
};


  if (error) {
    return (
      <div className="rounded-xl bg-white shadow-md p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchAnalyses}
              className="text-sm text-red-500 hover:text-red-700 mt-1 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="rounded-xl bg-white shadow-md p-6 flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }


  if (analyses.length === 0) {
    return (
      <div className="rounded-xl bg-white shadow-md p-6 text-center">
        <p className="text-gray-500">No analyses yet. Start by uploading a video!</p>
      </div>
    );
  }


  return (
    <div ref={containerRef} className="rounded-xl bg-white shadow-md">
      <h2 className="text-xl font-bold p-4 border-b text-gray-800">Recent Analyses</h2>
      {analyses.map((analysis) => (
        <Link
          href={`/dashboard/analysis/${analysis.id}`}
          key={analysis.id}
          className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 border-b last:border-b-0"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarPlaceholder(analysis.filename)}`}>
              {analysis.filename.substring(0, 1).toUpperCase()}
            </div>


            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{analysis.filename}</p>
              <p className="text-sm text-gray-500">{formatTimeAgo(analysis.created_at)}</p>
            </div>
          </div>


          <div className="flex items-center space-x-4 ml-4">
            <span className="hidden text-sm text-gray-500 md:block whitespace-nowrap">
              {getDisplayedConfidence(analysis)}% confidence
            </span>


            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase whitespace-nowrap ${
                analysis.is_deepfake
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {analysis.is_deepfake ? 'FAKE' : 'REAL'}
            </span>


            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        </Link>
      ))}


      <div className="p-4 text-center border-t">
        <Link
          href="/dashboard/history"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All Analyses →
        </Link>
      </div>
    </div>
  );
}
