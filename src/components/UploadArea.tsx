"use client";
import React from "react";
import { UploadCloud, CheckCircle, FileWarning, Loader2, X } from "lucide-react";

interface Props {
  analysisState: "IDLE" | "UPLOADING" | "ANALYZING";
  selectedFile: File | null;
  errorMessage: string | null;
  uploadProgress: number;
  currentFrame: number;
  framesToAnalyze: number;
  totalFrames: number;
  handleCancelUpload: () => Promise<void>;
  handleButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFileTypes: string;
  setSelectedFile: (f: File | null) => void;
  setErrorMessage: (m: string | null) => void;
  setFramesToAnalyze: (n: number) => void;
  MAX_FILE_SIZE_MB: number;
  SUPPORTED_FORMATS: string[];
}

import styles from "@/styles/NewAnalysis.module.css";

// Interface Props ...

const UploadArea: React.FC<Props> = ({
  analysisState,
  selectedFile,
  errorMessage,
  uploadProgress,
  currentFrame,
  framesToAnalyze,
  totalFrames,
  handleCancelUpload,
  handleButtonClick,
  handleFileChange,
  acceptedFileTypes,
  setSelectedFile,
  setErrorMessage,
  setFramesToAnalyze,
  MAX_FILE_SIZE_MB,
  SUPPORTED_FORMATS,
}) => {
  if (analysisState !== "IDLE" && selectedFile) {
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);

    return (
      <div className={styles.uploadWrapper}>
        <p className={styles.fileName}>{selectedFile.name}</p>

        <div className={styles.statusRow}>
          <span>{analysisState === "UPLOADING" ? "Uploading..." : "Processing file..."}</span>
          <span>{fileSizeMB} MB</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: `${analysisState === "UPLOADING" ? uploadProgress : 100}%` }} />
        </div>

        {analysisState === "UPLOADING" && (
          <div className={styles.centerColumn}>
            <Loader2 className={styles.loaderIcon} />
            <p className={styles.statusTitle}>Uploading file...</p>
            <p className={styles.statusDesc}>Please wait while we upload your file</p>

            <button onClick={handleCancelUpload} className={styles.cancelUploadButton}>
              <X size={16} />
              Cancel Upload
            </button>
          </div>
        )}

        {analysisState === "ANALYZING" && (
          <div className={styles.centerColumn}>
            <Loader2 className={styles.loaderIcon} />
            <p className={styles.statusTitle}>Analyzing frames...</p>
            <p className={styles.statusDescProcessing}>Processing frame <span className={styles.frameCounter}>{currentFrame}</span> of {framesToAnalyze}.</p>
            <p className={styles.progressDetail}>Total frames: {totalFrames}</p>
            <p className={styles.warningNote}>⏳ Analysis in progress - please do not close this page</p>
          </div>
        )}

        <div className={styles.infoAlert} role="alert">
          <p className="font-semibold">Note:</p>
          <p className="text-sm">{analysisState === "UPLOADING" ? "You can cancel the upload before analysis begins." : "Analysis may take 1-3 minutes. Once started, it cannot be cancelled."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.idleContainer}>
      {errorMessage ? <FileWarning className={styles.idleIconError} /> : selectedFile ? <CheckCircle className={styles.idleIconSuccess} /> : <UploadCloud className={styles.idleIconDefault} />}

      {errorMessage ? (
        <p className={styles.errorMessage}>{errorMessage}</p>
      ) : (
        <>
          <p className={styles.selectedFileText}>{selectedFile ? `File Selected: ${selectedFile.name}` : "Drop files to analyze"}</p>
          <p className={styles.instructionText}>{selectedFile ? "Ready to analyze." : "or click to browse from your device"}</p>
        </>
      )}

      <div className={styles.formatTags}>
        {SUPPORTED_FORMATS.map((format) => (
          <span key={format} className={styles.formatTag}>{format}</span>
        ))}
      </div>

      <p className={styles.sizeLimitText}>Maximum file size: {MAX_FILE_SIZE_MB}MB</p>

      {selectedFile ? (
        <div className={styles.actionButtons}>
          <button type="button" onClick={() => { setSelectedFile(null); setErrorMessage(null); setFramesToAnalyze(20); }} className={styles.cancelButton}><X size={18} />Cancel</button>
          <button type="button" onClick={handleButtonClick} disabled={analysisState === "UPLOADING" || analysisState === "ANALYZING"} className={styles.startButton}>Start Analysis</button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileChange} accept={acceptedFileTypes} />
          <button type="button" className={styles.selectButton} onClick={handleButtonClick}>Select File</button>
        </label>
      )}
    </div>
  );
};

export default UploadArea;
