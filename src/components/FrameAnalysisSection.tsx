// src/components/FrameAnalysisSection.tsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Download } from 'lucide-react';

interface Frame {
  id: number;
  label: "FAKE" | "REAL";
  confidence: number;
  imageUrl: string;
}

interface FrameAnalysisSectionProps {
  analysisId: string;
  frameWiseConfidences: number[];
  totalFrames: number;
}

const FrameAnalysisSection: React.FC<FrameAnalysisSectionProps> = ({ 
  analysisId, frameWiseConfidences, totalFrames 
}) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllFrames, setShowAllFrames] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    loadFrames();
  }, [analysisId]);

  const loadFrames = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(
        `${API_URL}/api/analysis/${analysisId}/download-frames`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to download frames');

      const blob = await response.blob();
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(blob);

      const extractedFrames: Frame[] = [];
      let frameIndex = 0;

      // Extract images
      for (const filename in zipContent.files) {
        if (filename.endsWith('.png') || filename.endsWith('.jpg')) {
          const file = zipContent.files[filename];
          const data = await file.async('blob');
          const imageUrl = URL.createObjectURL(data);
          
          const confidence = frameWiseConfidences[frameIndex] || 0.5;
          const label = confidence >= 0.5 ? 'FAKE' : 'REAL';

          extractedFrames.push({
            id: frameIndex + 1,
            label,
            confidence: Math.round(confidence * 100),
            imageUrl,
          });

          frameIndex++;
        }
      }

      setFrames(extractedFrames);
    } catch (err) {
      console.error('Error loading frames:', err);
      setError('Failed to load frames');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setDownloadingReport(true);
      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(
        `${API_URL}/api/analysis/${analysisId}/download-frames`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${analysisId}_report.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Frame Analysis</h3>
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const displayFrames = showAllFrames ? frames : frames.slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Frame Analysis</h3>
        <button
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {downloadingReport ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Download Report</span>
            </>
          )}
        </button>
      </div>
      
      {frames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No frames available</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {displayFrames.map((frame) => (
              <div key={frame.id} className="relative rounded-md overflow-hidden bg-gray-100">
                <img src={frame.imageUrl} alt={`Frame ${frame.id}`} className="w-full h-32 object-cover aspect-video" />
                <div className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-white text-xs font-medium ${
                  frame.label === "FAKE" ? 'bg-[#D93F3F]' : 'bg-green-600'
                }`}>
                  Frame {frame.id} &bull; {frame.label} {frame.confidence}%
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <span>{displayFrames.length} of {frames.length} frames</span>
            {!showAllFrames && frames.length > 4 && (
              <button
                onClick={() => setShowAllFrames(true)}
                className="flex items-center text-blue-600 hover:underline font-medium"
              >
                View All {frames.length} Frames <ArrowRight size={16} className="ml-1" />
              </button>
            )}
            {showAllFrames && (
              <button
                onClick={() => setShowAllFrames(false)}
                className="text-blue-600 hover:underline font-medium"
              >
                Show Less
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FrameAnalysisSection;
