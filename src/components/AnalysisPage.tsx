// src/components/AnalysisPage.tsx
'use client';

// 1. Added useRef and useMemo
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnalysisHeader from './AnalysisHeader';
import DeepfakeAlertCard from './DeepfakeAlertCard';
import ConfidenceOverTimeChart from './ConfidenceOverTimeChart';
import FrameAnalysisSection from './FrameAnalysisSection';
import UnderstandingConfidence from './UnderstandingConfidence';
import { Loader, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '@/../lib/store/analysisStore';
// 2. Fixed typo AND imported the CORRECT animation hook
import { useAnalysisResultsAnimation } from '@/hooks/useAnalysisResultsAnimation'; 

// --- Types ---
interface ConfidenceReport {
  video_id?: string;
  total_frames?: number;
  frames_analyzed?: number;
  average_confidence?: number;
  frame_wise_confidences?: number[];
}
interface AnalysisResponse {
  success: boolean;
  data: {
    id?: string;
    analysis_id: string;
    is_deepfake: boolean;
    confidence_score: number;
    frames_analyzed: number;
    filename: string;
    annotated_frames_path: string;
    created_at: string;
    status: 'processing' | 'completed' | 'failed';
    confidence_report?: ConfidenceReport;
    analysis_result?: ConfidenceReport | string;
  };
}
// ---

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const container = useRef(null); // 3. Added ref for animation
  
  const { currentAnalysis, loading, error, setAnalysis, setLoading, setError, reset } = useAnalysisStore();
  const [deleting, setDeleting] = useState(false);
  const [initialMount, setInitialMount] = useState(true);

  // 4. Call the animation hook
  useAnalysisResultsAnimation(container, !!currentAnalysis);

  // --- Data Fetching and Handlers ---
  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!analysisId || analysisId === 'undefined') {
        throw new Error('Invalid analysis ID');
      }
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Session expired.');
        if (response.status === 404) throw new Error('Analysis not found.');
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
      }
      const responseData: AnalysisResponse = await response.json();
      const data = responseData.data || responseData;
      let frameWiseConfidences: number[] = [];
      let confidenceReport: ConfidenceReport | null = null;
      if (data.analysis_result) {
        try {
          const analysisResult = typeof data.analysis_result === 'string'
            ? JSON.parse(data.analysis_result)
            : data.analysis_result;
          confidenceReport = analysisResult;
          frameWiseConfidences = analysisResult?.frame_wise_confidences || [];
        } catch (parseErr) {
          console.warn('⚠️ Failed to parse analysis_result:', parseErr);
        }
      }
      if (frameWiseConfidences.length === 0 && data.confidence_report) {
        confidenceReport = data.confidence_report;
        frameWiseConfidences = data.confidence_report.frame_wise_confidences || [];
      }
      const actualFramesAnalyzed = data.frames_analyzed > 0 ? data.frames_analyzed : frameWiseConfidences.length;
      setAnalysis({
        analysis_id: data.id || data.analysis_id,
        is_deepfake: data.is_deepfake ?? false,
        confidence_score: data.confidence_score ?? 0,
        frames_analyzed: actualFramesAnalyzed,
        frame_wise_confidences: frameWiseConfidences,
        confidence_report: confidenceReport,
        filename: data.filename || 'Unknown',
        annotated_frames_path: data.annotated_frames_path || '',
        created_at: data.created_at || new Date().toISOString(),
        status: data.status || 'completed',
        error_message: undefined
      });
    } catch (err: any) {
      console.error('❌ Error fetching analysis:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [analysisId, setAnalysis, setLoading, setError]);
  
  useEffect(() => {
    return () => reset();
  }, [reset]);
  
  useEffect(() => {
    if (analysisId && analysisId !== 'undefined') {
      fetchAnalysis().finally(() => setInitialMount(false));
    } else {
      setError('Invalid analysis ID');
      setLoading(false);
      setInitialMount(false);
    }
  }, [analysisId, fetchAnalysis, setError, setLoading]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }
    try {
      setDeleting(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete analysis');
      alert('Analysis deleted successfully');
      reset();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      alert(`Failed to delete analysis: ${err.message}`);
      setDeleting(false);
    }
  }, [analysisId, router, reset]);
  // --- End Data Fetching ---

  // --- 5. THIS IS THE FIX for the chart error ---
  // Transforms the number[] into ChartData[]
  const chartDataForComponent = useMemo(() => {
    if (!currentAnalysis?.frame_wise_confidences) {
      return [];
    }
    return currentAnalysis.frame_wise_confidences.map((conf, index) => {
      const isFake = conf >= 0.5;
      const fakeValue = isFake ? Math.max(conf * 100, 3) : 0;
      const realValue = !isFake ? Math.max((1 - conf) * 100, 3) : 0;
      
      return {
        name: `F${index + 1}`,
        FAKE: fakeValue,
        REAL: realValue
      };
    });
  }, [currentAnalysis?.frame_wise_confidences]);
  // --- END OF FIX ---

  // --- Loading / Error States ---
  if (loading || initialMount) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !currentAnalysis) {
    return (
      <div className="p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load analysis'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (currentAnalysis.status === 'failed') {
    return (
      <div className="p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-orange-600 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-2">The analysis failed to process</p>
          <p className="text-sm text-gray-500 mb-6">Check the server logs for details.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  // --- End States ---

  const totalFrames = currentAnalysis.confidence_report?.total_frames || currentAnalysis.frame_wise_confidences.length || 0;
  const averageConfidence = currentAnalysis.confidence_report?.average_confidence || currentAnalysis.confidence_score || 0;

  return (
    // 6. Add the ref to the main wrapper and REMOVE <main> tag
    <div className="max-w-7xl mx-auto space-y-6" ref={container}>
      {/* Analysis Header */}
      <AnalysisHeader
        analysisId={analysisId}
        fileName={currentAnalysis.filename}
        analyzedDate={new Date(currentAnalysis.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        modelVersion="v3.2"
        onDelete={handleDelete}
      />

      {/* 7. Add classNames for animation targets */}
      <div className="deepfake-alert-card">
        <DeepfakeAlertCard
          isDeepfake={currentAnalysis.is_deepfake}
          confidence={currentAnalysis.confidence_score}
          framesAnalyzed={currentAnalysis.frames_analyzed}
          totalFrames={totalFrames}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 confidence-chart">
        <ConfidenceOverTimeChart
          frameWiseConfidences={chartDataForComponent} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 frame-analysis-section">
          <FrameAnalysisSection
            analysisId={analysisId}
            frameWiseConfidences={currentAnalysis.frame_wise_confidences}
            annotatedFramesPath={currentAnalysis.annotated_frames_path}
            totalFrames={totalFrames}
            averageConfidence={averageConfidence}
          />
        </div>
        <div className="lg:col-span-1 understanding-confidence">
          <UnderstandingConfidence />
        </div>
      </div>
    </div>
  );
}