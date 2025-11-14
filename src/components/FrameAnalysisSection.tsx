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

  // Effect to handle loading frames and the report blob
  useEffect(() => {
    const objectUrls: string[] = []; // To store created object URLs for cleanup

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
            const token = localStorage.getItem('authToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const zipBlob = await response.blob();
              setReportBlob(zipBlob); // Store the blob for download button

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
                    objectUrls.push(url); // Store URL for cleanup
                    framesData[idx].url = url;
                  }
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not load images from ZIP:', err);
          }
        }

        framesData.sort((a, b) => a.id - b.id);
        setFrames(framesData);
      } finally {
        setLoading(false);
      }
    };

    loadFrames();

    // Cleanup function: revoke URLs ONLY when the component unmounts or data changes
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [analysisId, frameWiseConfidences, annotatedFramesPath]);

  // Download ZIP report handler
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      let blobToUse = reportBlob;

      if (!blobToUse) {
        console.warn("Report blob not found, re-fetching for download...");
        const token = localStorage.getItem('authToken');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to download report');
        blobToUse = await response.blob();
        setReportBlob(blobToUse); 
      }

      const url = window.URL.createObjectURL(blobToUse as Blob);
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

  // Display average confidence with proper formatting
  const getDisplayAverageConfidence = () => {
    const isFake = averageConfidence >= 0.5;
    return isFake
      ? (averageConfidence * 100).toFixed(2)
      : ((1 - averageConfidence) * 100).toFixed(2);
  };

  // === Modal handlers ===
  const openModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
  };

  const closeModal = useCallback(() => {
    setSelectedImageUrl(null);
  }, []);

  // Handle clicks outside the modal
  const handleOverlayClick = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  }, [closeModal]);

  // Handle Escape key for closing modal
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (selectedImageUrl) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('mousedown', handleOverlayClick);
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleOverlayClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [selectedImageUrl, closeModal, handleOverlayClick]);


  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
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
          disabled={downloading || !reportBlob}
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
      <div className="max-h-[749px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {frames.map((frame) => (
            <div key={frame.id} className="flex flex-col rounded-lg overflow-hidden shadow-md">
              <div
                className={`relative aspect-video bg-black border-2 border-b-0 ${
                  frame.isFake ? 'border-red-400' : 'border-green-400'
                }`}
              >
                {frame.url ? (
                  <img
                    src={frame.url}
                    alt={`Frame ${frame.id + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => openModal(frame.url!)}
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

      {/* Image Modal (Lightbox) */}
      {selectedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div ref={modalRef} className="relative max-w-full max-h-full bg-white rounded-lg shadow-xl">
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 m-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Close image"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedImageUrl} 
              alt="Enlarged Frame" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameAnalysisSection;