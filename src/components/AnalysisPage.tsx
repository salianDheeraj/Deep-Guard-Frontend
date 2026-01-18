// src/components/AnalysisPage.tsx - FIXED for HttpOnly Cookie Auth
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

import AnalysisHeader from './AnalysisHeader';
import DeepfakeAlertCard from './DeepfakeAlertCard';
import ConfidenceOverTimeChart from './ConfidenceOverTimeChart';
import FrameAnalysisSection from './FrameAnalysisSection';
import ImageAnalysisSection from './ImageAnalysisSection';
import UnderstandingConfidence from './UnderstandingConfidence';

import { Loader, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '@/../lib/store/analysisStore';
import styles from '@/styles/Analysis.module.css';

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
        if (response.status === 401) {
          router.push('/login');
          return;
        }
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
        } catch { }
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
      <div className={styles.loaderContainer}>
        <Loader className={styles.spinner} />
      </div>
    );
  }

  if (error || !currentAnalysis) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <AlertCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className={styles.retryButton}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER UI (Updated for Image vs Video)
  // ----------------------------------------------------
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const isImage =
    currentAnalysis.filename?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ||
    // Fallback for guest analysis where filename might not have extension
    (currentAnalysis.frames_analyzed === 1 && !currentAnalysis.filename?.toLowerCase().endsWith('.mp4'));

  if (isImage) {
    return (
      // Responsive Container: p-4 on mobile, p-8 on desktop
      <main className={`${styles.pageContainer} p-4 md:p-8 w-full max-w-7xl mx-auto`}>
        <div className={styles.contentWrapper}>
          <AnalysisHeader
            analysisId={analysisId}
            fileName={currentAnalysis.filename}
            analyzedDate={new Date(currentAnalysis.created_at).toLocaleDateString()}
            modelVersion="v3.2"
            onDelete={handleDelete}
          />
          <div className="mt-6 md:mt-8">
            <ImageAnalysisSection
              imageUrl={`${API_URL}/api/analysis/${analysisId}/file`}
              isDeepfake={currentAnalysis.is_deepfake}
              confidenceScore={currentAnalysis.confidence_score}
              createdAt={new Date(currentAnalysis.created_at).toLocaleDateString()}
            />
          </div>
        </div>
      </main>
    );
  }

  // VIDEO UI (Existing)
  const totalFrames =
    currentAnalysis.confidence_report?.total_frames ||
    currentAnalysis.frame_wise_confidences.length;

  const averageConfidence =
    currentAnalysis.confidence_report?.average_confidence ||
    currentAnalysis.confidence_score;

  return (
    // Responsive Container: p-4 on mobile, p-8 on desktop
    <main className={`${styles.pageContainer} p-4 md:p-8 w-full max-w-7xl mx-auto`}>
      <div className={`${styles.contentWrapper} space-y-6 md:space-y-8`}>

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

        {/* Responsive Grid: Stack on mobile (cols-1), Side-by-side on desktop (lg:cols-2) */}
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