// lib/store/analysisStore.ts
import { create } from 'zustand';

interface ConfidenceReport {
  video_id?: string;
  total_frames?: number;
  frames_analyzed?: number;
  average_confidence?: number;
  frame_wise_confidences?: number[];
}

interface Analysis {
  analysis_id: string;
  is_deepfake: boolean;
  confidence_score: number;
  frames_analyzed: number;
  frame_wise_confidences: number[];
  confidence_report: ConfidenceReport | null;
  filename: string;
  annotated_frames_path: string;
  created_at: string;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
}

interface AnalysisStore {
  currentAnalysis: Analysis | null;
  loading: boolean;
  error: string | null;
  setAnalysis: (analysis: Analysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  currentAnalysis: null,
  loading: false,
  error: null,
  
  setAnalysis: (analysis) => set({ currentAnalysis: analysis, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  reset: () => set({ currentAnalysis: null, loading: false, error: null }),
}));
