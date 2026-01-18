// src/components/AnalysisHeader.tsx
import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

import styles from '@/styles/Analysis.module.css';

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
    /* Responsive Layout:
      - Mobile: Flex Column (stack title and button), Gap 4.
      - Desktop (md): Flex Row (side-by-side), aligns center.
    */
    <div className={`${styles.headerContainer} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>

      <div className="flex flex-col max-w-full">
        <h1 className={`${styles.headerTitle} text-2xl md:text-3xl font-bold truncate`}>
          Analysis Results
        </h1>

        <p className={`${styles.headerMeta} text-sm md:text-base mt-1 break-all`}>
          {fileName} &bull; Analyzed on {analyzedDate} &bull; Model {modelVersion}
        </p>
      </div>

      {/* Button Position: Aligns right (self-end) on mobile, center vertically on desktop */}
      <div className="flex space-x-3 items-center self-end md:self-auto shrink-0">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`${styles.deleteButton} ${isDeleting
            ? styles.deleteButtonDisabled
            : ''
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