// src/components/AnalysisHeader.tsx
import React, { useState } from 'react';
import { Download, Loader2, Trash2 } from 'lucide-react';

interface AnalysisHeaderProps {
  analysisId: string;
  fileName: string;
  analyzedDate: string;
  modelVersion: string;
  onDelete?: () => void;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ 
  analysisId, fileName, analyzedDate, modelVersion, onDelete 
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
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
      link.download = `analysis_${analysisId}_frames.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-800">Analysis Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          {fileName} &bull; Analyzed on {analyzedDate} &bull; Model {modelVersion}
        </p>
      </div>
      <div className="flex space-x-3 items-center">
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {downloading ? (
            <><Loader2 size={16} className="animate-spin" /><span>Downloading...</span></>
          ) : (
            <><Download size={16} /><span>Download Report</span></>
          )}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 size={16} className="inline mr-2" />Delete
        </button>
      </div>
    </div>
  );
};

export default AnalysisHeader;
