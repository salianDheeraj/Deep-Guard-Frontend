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
    <div className={styles.headerContainer}>
      <div className="flex flex-col">
        {/* FIXED: Added dark:text-white */}
        <h1 className={styles.headerTitle}>
          Analysis Results
        </h1>

        {/* FIXED: Added dark:text-gray-400 */}
        <p className={styles.headerMeta}>
          {fileName} &bull; Analyzed on {analyzedDate} &bull; Model {modelVersion}
        </p>
      </div>

      <div className="flex space-x-3 items-center">
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