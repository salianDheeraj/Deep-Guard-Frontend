// src/components/AnalysisPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnalysisHeader from './AnalysisHeader';
import DeepfakeAlertCard from './DeepfakeAlertCard';
import ConfidenceOverTimeChart from './ConfidenceOverTimeChart';
import FrameAnalysisSection from './FrameAnalysisSection';
import UnderstandingConfidence from './UnderstandingConfidence';
import { Loader } from 'lucide-react';

interface AnalysisData {
  analysis_id: string;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  total_frames: number;
  frame_wise_confidences: number[];
  filename: string;
  annotated_frames_path: string;
  created_at: string;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId || analysisId === 'undefined') {
      setError('Invalid analysis ID');
      setLoading(false);
      return;
    }
    fetchAnalysis();
  }, [analysisId]);

 const fetchAnalysis = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch analysis');

    const data = await response.json();
    console.log('📥 API response:', data);

    // ✅ INITIALIZE analysisResult FIRST
    let analysisResult = {
      frame_wise_confidences: []
    };

    // Then try to parse if it exists
    if (data.analysis_result) {
      try {
        analysisResult = typeof data.analysis_result === 'string'
          ? JSON.parse(data.analysis_result)
          : data.analysis_result;
      } catch (parseErr) {
        console.error('Error parsing analysis_result:', parseErr);
      }
    }

    console.log('✅ Final analysisResult:', analysisResult);

    setAnalysisData({
      analysis_id: data.id,
      is_deepfake: data.is_deepfake,
      confidence_score: data.confidence_score,
      frames_analyzed: data.frames_to_analyze,
      total_frames: data.total_frames || 0,
      frame_wise_confidences: analysisResult?.frame_wise_confidences || [],
      filename: data.filename,
      annotated_frames_path: data.annotated_frames_path,
      created_at: data.created_at
    });
  } catch (err: any) {
    console.error('Error fetching analysis:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
        // ❌ REMOVED: credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Analysis deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Failed to load analysis'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalysisHeader
          analysisId={analysisId}
          fileName={analysisData.filename}
          analyzedDate={new Date(analysisData.created_at).toLocaleDateString()}
          modelVersion="v3.2" // Updated to match screenshot
          onDelete={handleDelete}
        />

        <DeepfakeAlertCard
          isDeepfake={analysisData.is_deepfake}
          confidence={analysisData.confidence_score}
          framesAnalyzed={analysisData.frames_analyzed}
          totalFrames={analysisData.total_frames}
        />
        
        {/* New 2/3 and 1/3 grid layout for main content to match screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <FrameAnalysisSection
                    analysisId={analysisId}
                    frameWiseConfidences={analysisData.frame_wise_confidences}
                    annotatedFramesPath={analysisData.annotated_frames_path}
                    totalFrames={analysisData.total_frames} 
                />
            </div>
            <div>
                <ConfidenceOverTimeChart
                    frameWiseConfidences={analysisData.frame_wise_confidences}
                />
            </div>
        </div>

        <UnderstandingConfidence />
      </div>
    </main>
  );
}