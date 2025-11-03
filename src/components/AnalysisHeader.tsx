// src/components/AnalysisHeader.tsx
import React from 'react';
import { Download } from 'lucide-react';

interface AnalysisHeaderProps {
  fileName: string;
  analyzedDate: string;
  modelVersion: string;
}

const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ fileName, analyzedDate, modelVersion }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-gray-800">Analysis Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          {fileName} &bull; Analyzed on {analyzedDate} &bull; Model {modelVersion}
        </p>
      </div>
      <div className="flex space-x-3 items-center">
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <Download size={16} />
          <span>Download Report</span>
        </button>
        <button className="px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
};

export default AnalysisHeader;