'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, Download, X } from 'lucide-react';
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
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load frames & images
  useEffect(() => {
    const objectUrls: string[] = [];

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

        if (annotatedFramesPath) {
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            // **Send cookies instead of token**
            const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
              method: "GET",
              credentials: "include", // IMPORTANT
            });

            if (response.ok) {
              const zipBlob = await response.blob();
              setReportBlob(zipBlob);

              const jszip = new JSZip();
              const zipData = await jszip.loadAsync(zipBlob);

              for (const [filename, file] of Object.entries(zipData.files)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                if (isImage && !file.dir) {
                  const match = filename.match(/(\d+)(?!.*\d)/);
                  const idx = match ? parseInt(match[1], 10) : null;

                  if (idx !== null && idx >= 0 && idx < framesData.length) {
                    const imageBlob = await file.async('blob');
                    const url = URL.createObjectURL(imageBlob);
                    objectUrls.push(url);
                    framesData[idx].url = url;
                  }
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not load images from ZIP:', err);
          }
        }

        setFrames(framesData.sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    loadFrames();

    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [analysisId, frameWiseConfidences, annotatedFramesPath]);

  // Download ZIP
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      let blobToUse = reportBlob;

      if (!blobToUse) {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error('Failed to download report');
        blobToUse = await response.blob();
        setReportBlob(blobToUse);
      }

      const url = window.URL.createObjectURL(blobToUse);
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

  // Modal logic
  const openModal = (imageUrl: string) => setSelectedImageUrl(imageUrl);
  const closeModal = useCallback(() => setSelectedImageUrl(null), []);

  const handleOverlayClick = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => event.key === 'Escape' && closeModal();

    if (selectedImageUrl) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('mousedown', handleOverlayClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [selectedImageUrl, closeModal, handleOverlayClick]);

  const getDisplayAverageConfidence = () =>
    averageConfidence >= 0.5
      ? (averageConfidence * 100).toFixed(2)
      : ((1 - averageConfidence) * 100).toFixed(2);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 h-full flex flex-col transition-colors duration-300">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Frame Analysis</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading frames...</p>
        </div>
      </div>
    );
  }

  if (!frameWiseConfidences?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Frame Analysis</h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No frame data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Frame Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Average Confidence: {getDisplayAverageConfidence()}%
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloading || !reportBlob}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 font-medium transition-colors"
        >
          {downloading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Report
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="max-h-[749px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {frames.map((frame) => (
            <div key={frame.id} className="flex flex-col rounded-lg shadow-md overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
              <div
                className={`relative aspect-video border-2 border-b-0 ${frame.isFake ? 'border-red-400 dark:border-red-500' : 'border-green-400 dark:border-green-500'
                  }`}
              >
                {frame.url ? (
                  <img
                    src={frame.url}
                    alt={`Frame ${frame.id + 1}`}
                    className="w-full h-full object-contain cursor-pointer hover:scale-[1.02] transition"
                    onClick={() => openModal(frame.url!)}
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${frame.isFake ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                      }`}
                  >
                    <span className="text-gray-400 dark:text-gray-500 text-xs">No image</span>
                  </div>
                )}
              </div>

              <div
                className={`rounded-b-lg border-2 border-t-0 text-white p-2 text-xs font-bold flex justify-between ${frame.isFake
                    ? 'border-red-400 bg-red-600 hover:bg-red-700 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-700'
                    : 'border-green-400 bg-green-600 hover:bg-green-700 dark:border-green-500 dark:bg-green-600 dark:hover:bg-green-700'
                  }`}
              >
                <span>Frame {frame.id + 1}: {frame.label}</span>
                <span>{frame.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 mt-4 pt-4">Total: {frames.length} frames</div>

      {/* Modal */}
      {selectedImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div ref={modalRef} className="relative max-w-full max-h-full bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full p-1 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImageUrl}
              alt="Enlarged Frame"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameAnalysisSection;