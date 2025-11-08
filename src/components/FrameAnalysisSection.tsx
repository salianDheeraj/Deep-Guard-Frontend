// src/components/FrameAnalysisSection.tsx - With Download Report button
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
  averageConfidence
}) => {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadFrames = async () => {
      try {
        setLoading(true);

        // ✅ Create frame data from confidences with correct calculation
        const framesData: FrameData[] = frameWiseConfidences.map((confidence, index) => {
          const isFake = confidence >= 0.5;
          
          return {
            id: index,
            label: isFake ? 'FAKE' : 'REAL',
            // ✅ FAKE: show actual confidence, REAL: show 100 - confidence
            confidence: isFake 
              ? Math.round(confidence * 100)           // FAKE: actual confidence
              : Math.round((1 - confidence) * 100),    // REAL: 100 - confidence
            isFake: isFake
          };
        });

        // ✅ Try to get images from ZIP
        if (annotatedFramesPath) {
          try {
            const token = localStorage.getItem('authToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const response = await fetch(
              `${API_URL}/api/analysis/${analysisId}/download`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (response.ok) {
              const zipBlob = await response.blob();
              const jszip = new JSZip();
              const zipData = await jszip.loadAsync(zipBlob);

              // ✅ Match images to frames
              let imageIdx = 0;
              for (const [filename, file] of Object.entries(zipData.files)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                const isJson = filename.endsWith('.json');

                if (isImage && !isJson && !file.dir && imageIdx < framesData.length) {
                  try {
                    const imageBlob = await file.async('blob');
                    const url = URL.createObjectURL(imageBlob);
                    framesData[imageIdx].url = url;
                    imageIdx++;
                  } catch (err) {
                    console.warn(`⚠️ Could not extract ${filename}`);
                  }
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not load images:', err);
          }
        }

        setFrames(framesData);
      } finally {
        setLoading(false);
      }
    };

    loadFrames();
  }, [analysisId, frameWiseConfidences, annotatedFramesPath]);

  // ✅ Download ZIP file
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);

      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(
        `${API_URL}/api/analysis/${analysisId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${analysisId}_report.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Report downloaded successfully');
    } catch (err: any) {
      console.error('❌ Download error:', err);
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // ✅ Calculate display average confidence
  const getDisplayAverageConfidence = () => {
    const isFake = averageConfidence >= 0.5;
    if (isFake) {
      return (averageConfidence * 100).toFixed(2);
    } else {
      return ((1 - averageConfidence) * 100).toFixed(2);
    }
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
        
        {/* ✅ Download Report Button */}
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
      
      {/* ✅ Scrollable Grid - ALL frames visible with scroll */}
      <div className="max-h-[700px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {frames.map((frame) => (
            <div key={frame.id} className="flex flex-col">
              {/* Image container */}
              <div
                className={`relative rounded-t-lg overflow-hidden shadow-md border-2 border-b-0 ${
                  frame.isFake ? 'border-red-400' : 'border-green-400'
                }`}
              >
                {frame.url ? (
                  <img
                    src={frame.url}
                    alt={`Frame ${frame.id + 1}`}
                    className="w-full h-56 object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-56 flex items-center justify-center ${
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
                <span>Frame {frame.id + 1}: {frame.label}</span>
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
