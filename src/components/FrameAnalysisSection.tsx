// src/components/FrameAnalysisSection.tsx
'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface FrameAnalysisSectionProps {
  analysisId: string;
  frameWiseConfidences: number[];
  annotatedFramesPath: string;
  totalFrames: number;
}

// Mock function to generate an image source URL based on the frame index
const getFrameImageUrl = (frameIndex: number): string => {
  // Use generic placeholder images for visual variety, mimicking the screenshot
  const mockImages = [
    'https://picsum.photos/seed/face1/200/200',
    'https://picsum.photos/seed/face2/200/200',
    'https://picsum.photos/seed/face3/200/200',
    'https://picsum.photos/seed/face4/200/200',
    'https://picsum.photos/seed/face5/200/200',
    'https://picsum.photos/seed/face6/200/200',
    'https://picsum.photos/seed/face7/200/200',
    'https://picsum.photos/seed/face8/200/200',
    'https://picsum.photos/seed/face9/200/200',
    'https://picsum.photos/seed/face10/200/200',
  ];
  return mockImages[frameIndex % mockImages.length];
};

const FrameAnalysisSection: React.FC<FrameAnalysisSectionProps> = ({
  analysisId,
  frameWiseConfidences,
  annotatedFramesPath,
  totalFrames
}) => {
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [showAllFrames, setShowAllFrames] = useState(false);

  // Create frame data from confidences
  const frames = frameWiseConfidences.map((confidence, index) => ({
    id: index + 1,
    label: confidence >= 0.5 ? 'FAKE' : 'REAL',
    confidence: Math.round(confidence * 100),
    imageSrc: getFrameImageUrl(index)
  }));

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `${API_URL}/api/analysis/${analysisId}/download-frames`, 
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${analysisId}_annotated_frames.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download annotated frames');
    } finally {
      setDownloadingReport(false);
    }
  };

  // Display the first 8 frames to match the screenshot layout unless 'View All' is clicked
  const framesToShow = showAllFrames ? frames : frames.slice(0, 8); 
  
  // Use totalFrames from props, defaulting to 120 (screenshot value) if 0
  const framesCount = totalFrames || 120;
  
  const getLabelColor = (isFake: boolean) => (isFake ? 'bg-red-600' : 'bg-green-600');

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Frame Analysis</h3>
      </div>
      
      {frames.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No frame data available</p>
        </div>
      ) : (
        <>
          {/* Frames Grid: 4 columns as per screenshot (on wider screens) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {framesToShow.map((frame) => (
              <div
                key={frame.id}
                className="relative rounded-lg overflow-hidden shadow-md"
              >
                {/* Image Placeholder */}
                <div className="w-full h-auto aspect-square bg-gray-200">
                    <img
                        src={frame.imageSrc}
                        alt={`Frame ${frame.id}`}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                        // Fallback if image fails to load
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'text-gray-500', 'text-sm');
                            e.currentTarget.parentElement!.innerHTML = `<div class="text-center">Frame ${frame.id}</div>`;
                        }}
                    />
                </div>
                {/* Confidence Label Overlay (bottom-left) */}
                <div 
                  className={`absolute bottom-0 left-0 p-1 px-2 ${getLabelColor(frame.label === 'FAKE')} text-white text-xs font-semibold rounded-tr-lg`}
                >
                  Frame {frame.id} • {frame.label} {frame.confidence}%
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Showing X of Y frames & View All */}
          <div className="flex justify-between items-center text-sm text-gray-600 mt-6">
            <span className='font-medium'>Showing {framesToShow.length} of {framesCount} frames</span>
            
            <div className='flex space-x-4 items-center'>
              {!showAllFrames && frames.length > 8 && (
                <button
                  onClick={() => setShowAllFrames(true)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  View All Frames →
                </button>
              )}
              {showAllFrames && frames.length > 8 && (
                <button
                  onClick={() => setShowAllFrames(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Show Less ↑
                </button>
              )}
               <button
                  onClick={handleDownloadReport}
                  disabled={downloadingReport}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:bg-gray-300 transition border border-gray-200"
              >
                  {downloadingReport ? (
                      <><Loader2 size={16} className="animate-spin" /><span>Downloading...</span></>
                  ) : (
                      <><Download size={16} /><span>Download Frames</span></>
                  )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FrameAnalysisSection;