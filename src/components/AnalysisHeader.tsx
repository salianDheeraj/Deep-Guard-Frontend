// src/components/AnalysisHeader.tsx
import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex flex-col">
        {/* FIXED: Added dark:text-white */}
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Analysis Results
        </h1>
        
        {/* FIXED: Added dark:text-gray-400 */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {fileName} &bull; Analyzed on {analyzedDate} &bull; Model {modelVersion}
        </p>
      </div>
      
      <div className="flex space-x-3 items-center">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium transition-colors ${
            isDeleting 
              ? 'bg-red-50 dark:bg-red-900/30 opacity-50 cursor-not-allowed' 
              : 'hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          {isDeleting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 size={16} />
              <span>Delete</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalysisHeader;