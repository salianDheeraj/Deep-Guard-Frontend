// src/components/AnalysisPage.tsx - FIXED for HttpOnly Cookie Auth
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import AnalysisHeader from './AnalysisHeader';
import DeepfakeAlertCard from './DeepfakeAlertCard';
import ConfidenceOverTimeChart from './ConfidenceOverTimeChart';
import FrameAnalysisSection from './FrameAnalysisSection';
import UnderstandingConfidence from './UnderstandingConfidence';

import { Loader, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '@/../lib/store/analysisStore';
import { useAnalysisResultsAnimation } from '@/hooks/useAnalysisResultsAnimation';

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

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const resultsRef = useRef<HTMLDivElement>(null);

  const { currentAnalysis, loading, error, setAnalysis, setLoading, setError, reset } =
    useAnalysisStore();

  const [deleting, setDeleting] = useState(false);
  const [initialMount, setInitialMount] = useState(true);

  // ----------------------------------------------------
  // FETCH ANALYSIS (AUTH PATCHED: cookies → include)
  // ----------------------------------------------------
  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!analysisId || analysisId === 'undefined') {
        throw new Error('Invalid analysis ID');
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
        method: 'GET',
        credentials: "include",        // ← PATCH
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
          const parsed =
            typeof data.analysis_result === 'string'
              ? JSON.parse(data.analysis_result)
              : data.analysis_result;

          confidenceReport = parsed;
          frameWiseConfidences = parsed.frame_wise_confidences || [];
        } catch {}
      }

      if (!frameWiseConfidences.length && data.confidence_report) {
        confidenceReport = data.confidence_report;
        frameWiseConfidences = data.confidence_report.frame_wise_confidences || [];
      }

      const actualFramesAnalyzed =
        data.frames_analyzed > 0 ? data.frames_analyzed : frameWiseConfidences.length;

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [analysisId, setAnalysis, setError, setLoading]);

  // cleanup
  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    if (analysisId && analysisId !== 'undefined') {
      fetchAnalysis().finally(() => setInitialMount(false));
    } else {
      setError('Invalid analysis ID');
      setInitialMount(false);
      setLoading(false);
    }
  }, [analysisId, fetchAnalysis]);

  // ----------------------------------------------------
  // DELETE ANALYSIS (AUTH PATCHED)
  // ----------------------------------------------------
  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      setDeleting(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${analysisId}`, {
        method: 'DELETE',
        credentials: "include",        // ← PATCH
      });

      if (!response.ok) throw new Error('Failed to delete analysis');

      alert('Analysis deleted successfully');

      reset();
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  }, [analysisId, router, reset]);

  // ----------------------------------------------------
  // LOADING UI
  // ----------------------------------------------------
  if (loading || initialMount) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !currentAnalysis) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER UI (unchanged)
  // ----------------------------------------------------
  const totalFrames =
    currentAnalysis.confidence_report?.total_frames ||
    currentAnalysis.frame_wise_confidences.length;

  const averageConfidence =
    currentAnalysis.confidence_report?.average_confidence ||
    currentAnalysis.confidence_score;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <AnalysisHeader
          analysisId={analysisId}
          fileName={currentAnalysis.filename}
          analyzedDate={new Date(currentAnalysis.created_at).toLocaleDateString()}
          modelVersion="v3.2"
          onDelete={handleDelete}
        />

        <DeepfakeAlertCard
          isDeepfake={currentAnalysis.is_deepfake}
          confidence={currentAnalysis.confidence_score}
          framesAnalyzed={currentAnalysis.frames_analyzed}
          totalFrames={totalFrames}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FrameAnalysisSection
            analysisId={analysisId}
            frameWiseConfidences={currentAnalysis.frame_wise_confidences}
            annotatedFramesPath={currentAnalysis.annotated_frames_path}
            totalFrames={totalFrames}
            averageConfidence={averageConfidence}
          />

          <ConfidenceOverTimeChart
            frameWiseConfidences={currentAnalysis.frame_wise_confidences}
          />
        </div>

        <UnderstandingConfidence />

      </div>
    </main>
  );
}
