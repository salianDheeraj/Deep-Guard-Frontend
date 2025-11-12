'use client';

import React, { useState, useEffect } from 'react';
import { Loader, Download } from 'lucide-react';
import JSZip from 'jszip';

interface FrameAnalysisSectionProps {
  analysisId: string;
  frameWiseConfidences: number[];
  annotatedFramesPath: string;
  totalFrames: number;
  averageConfidence: number;
}

interface FrameData {
  id: number;
  label: string;
  confidence: number;
  isFake: boolean;
  url?: string;
}

const FrameAnalysisSection: React.FC<FrameAnalysisSectionProps> = ({
  analysisId,
  frameWiseConfidences = [],
  annotatedFramesPath,
  totalFrames,
  averageConfidence,
}) => {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadFrames = async () => {
      try {
        setLoading(true);

        const framesData: FrameData[] = frameWiseConfidences.map((confidence, index) => {
          const isFake = confidence >= 0.5;
          return {
            id: index,
            label: isFake ? 'FAKE' : 'REAL',
            confidence: isFake
              ? Math.round(confidence * 100)
              : Math.round((1 - confidence) * 100),
            isFake,
          };
        });

        // Load annotated frames from ZIP
        if (annotatedFramesPath) {
          try {
            const token = localStorage.getItem('authToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const zipBlob = await response.blob();
              const jszip = new JSZip();
              const zipData = await jszip.loadAsync(zipBlob);

              for (const [filename, file] of Object.entries(zipData.files)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                if (isImage && !file.dir) {
                  const match = filename.match(/(\d+)(?=\.jpg|\.jpeg|\.png|\.gif|\.webp$)/i);
                  const idx = match ? parseInt(match[1], 10) : null;

                  if (idx !== null && idx >= 0 && idx < framesData.length) {
                    const imageBlob = await file.async('blob');
                    const url = URL.createObjectURL(imageBlob);
                    framesData[idx].url = url;
                  }
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not load images:', err);
          }
        }

        framesData.sort((a, b) => a.id - b.id);
        setFrames(framesData);
      } finally {
        setLoading(false);
      }
    };

    loadFrames();
  }, [analysisId, frameWiseConfidences, annotatedFramesPath]);

  // ✅ Download ZIP report
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);

      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${analysisId}_report.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('❌ Download error:', err);
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Display average confidence
  const getDisplayAverageConfidence = () => {
    const isFake = averageConfidence >= 0.5;
    return isFake
      ? (averageConfidence * 100).toFixed(2)
      : ((1 - averageConfidence) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Frame Analysis</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <p className="text-gray-600">Loading frames...</p>
        </div>
      </div>
    );
  }

  if (!frameWiseConfidences || frames.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Frame Analysis</h3>
        <div className="text-center py-12 text-gray-500">
          <p>No frame data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Download button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Frame Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            Average Confidence: {getDisplayAverageConfidence()}%
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {downloading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Report
            </>
          )}
        </button>
      </div>

      {/* Scrollable Grid */}
      <div className="max-h-[700px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {frames.map((frame) => (
            <div key={frame.id} className="flex flex-col rounded-lg overflow-hidden shadow-md">
              {/* Image container with correct aspect ratio */}
              <div
                className={`relative aspect-video bg-black border-2 border-b-0 ${
                  frame.isFake ? 'border-red-400' : 'border-green-400'
                }`}
              >
                {frame.url ? (
                  <img
                    src={frame.url}
                    alt={`Frame ${frame.id + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02]"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      frame.isFake ? 'bg-red-50' : 'bg-green-50'
                    }`}
                  >
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Badge below */}
              <div
                className={`rounded-b-lg border-2 border-t-0 ${
                  frame.isFake
                    ? 'border-red-400 bg-red-600 hover:bg-red-700'
                    : 'border-green-400 bg-green-600 hover:bg-green-700'
                } text-white p-2 text-xs font-bold flex items-center justify-between transition-colors`}
              >
                <span>
                  Frame {frame.id + 1}: {frame.label}
                </span>
                <span>{frame.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame count */}
      <div className="text-sm text-gray-600 border-t mt-4 pt-4">
        <span>Total: {frames.length} frames</span>
      </div>
    </div>
  );
};

export default FrameAnalysisSection;
