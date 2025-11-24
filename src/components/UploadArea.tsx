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
      <div className="text-left w-full">
        <p className="text-lg font-medium text-gray-800 dark:text-white mb-1">{selectedFile.name}</p>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{analysisState === "UPLOADING" ? "Uploading..." : "Processing file..."}</span>
          <span>{fileSizeMB} MB</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mb-6 overflow-hidden">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${analysisState === "UPLOADING" ? uploadProgress : 100}%` }} />
        </div>

        {analysisState === "UPLOADING" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Uploading file...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please wait while we upload your file</p>

            <button onClick={handleCancelUpload} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2">
              <X size={16} />
              Cancel Upload
            </button>
          </div>
        )}

        {analysisState === "ANALYZING" && (
          <div className="flex flex-col items-center justify-center py-6 transition-all duration-500">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Analyzing frames...</p>
            <p className="text-gray-500 dark:text-gray-400">Processing frame <span className="frame-counter font-semibold text-indigo-600 dark:text-indigo-400">{currentFrame}</span> of {framesToAnalyze}.</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Total frames: {totalFrames}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 font-medium">⏳ Analysis in progress - please do not close this page</p>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 p-4 mt-4" role="alert">
          <p className="font-semibold">Note:</p>
          <p className="text-sm">{analysisState === "UPLOADING" ? "You can cancel the upload before analysis begins." : "Analysis may take 1-3 minutes. Once started, it cannot be cancelled."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {errorMessage ? <FileWarning className="w-12 h-12 text-red-500 mb-4" /> : selectedFile ? <CheckCircle className="w-12 h-12 text-green-500 mb-4" /> : <UploadCloud className="w-12 h-12 text-indigo-500 mb-4" />}

      {errorMessage ? (
        <p className="text-red-600 font-medium mb-4 text-center">{errorMessage}</p>
      ) : (
        <>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-2">{selectedFile ? `File Selected: ${selectedFile.name}` : "Drop files to analyze"}</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{selectedFile ? "Ready to analyze." : "or click to browse from your device"}</p>
        </>
      )}

      <div className="flex space-x-2 mb-4">
        {SUPPORTED_FORMATS.map((format) => (
          <span key={format} className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600">{format}</span>
        ))}
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>

      {selectedFile ? (
        <div className="flex gap-3">
          <button type="button" onClick={() => { setSelectedFile(null); setErrorMessage(null); setFramesToAnalyze(20); }} className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition duration-150 flex items-center gap-2"><X size={18} />Cancel</button>
          <button type="button" onClick={handleButtonClick} disabled={analysisState === "UPLOADING" || analysisState === "ANALYZING"} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-300">Start Analysis</button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileChange} accept={acceptedFileTypes} />
          <button type="button" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md" onClick={handleButtonClick}>Select File</button>
        </label>
      )}
    </div>
  );
};

export default UploadArea;
