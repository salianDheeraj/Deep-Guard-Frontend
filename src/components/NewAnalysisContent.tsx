"use client";

import React, { useState, useCallback, useMemo, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, Shield, Cpu, Image as ImageIcon, LucideIcon, FileWarning, Loader2 } from 'lucide-react';

interface FeatureItem {
  title: string;
  desc: string;
  icon: LucideIcon;
}

type AnalysisState = 'IDLE' | 'UPLOADING' | 'ANALYZING';

const MAX_FILE_SIZE_MB = 10;
const SUPPORTED_FORMATS = ["JPG", "PNG", "MP4"];

const NewAnalysisContent: React.FC = () => {
  const router = useRouter();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('IDLE');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFrame, setCurrentFrame] = useState<number>(27);
  const [totalFrames, setTotalFrames] = useState<number>(120);

  const acceptedFileTypes: string = useMemo(() => {
    return SUPPORTED_FORMATS.map(f => `.${f.toLowerCase()}`).join(',');
  }, []);
  
  const features: FeatureItem[] = useMemo(() => [
    { title: "Supported Formats", desc: `Images (JPG, PNG), Video (MP4)`, icon: ImageIcon },
    { title: "Secure Processing", desc: "All files are encrypted and automatically deleted after 30 days", icon: Shield },
    { title: "AI-Powered Detection", desc: "Advanced neural networks analyze each frame for manipulation", icon: Cpu },
  ], []);

  const validateFile = useCallback((file: File | null) => {
    setErrorMessage(null);
    if (!file) return false;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setErrorMessage(`File size is too high: ${fileSizeMB.toFixed(2)} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return false;
    }

    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      setErrorMessage(`Unsupported file type. Please use ${SUPPORTED_FORMATS.join(', ')}.`);
      return false;
    }
    
    return true;
  }, []);

  const processFiles = (files: FileList) => {
    const file = files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
    setIsDragging(false);
  };
  
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    processFiles(event.dataTransfer.files);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      processFiles(event.target.files);
    }
  };
  const startMLAnalysis = async (analysisId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    console.log(`🔍 Starting ML analysis: ${analysisId}`);

    const response = await fetch(`${API_URL}/api/ml/analyze/${analysisId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ ML error:', data.message);
      return false;
    }

    console.log('✅ ML completed:', data.data);
    return true;

  } catch (error) {
    console.error('❌ ML error:', error);
    return false;
  }
};

  // ✅ FIX: Use authToken instead of token
  const startAnalysisPlaceholder = async () => {
    if (selectedFile && validateFile(selectedFile)) {
      setAnalysisState('UPLOADING');
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('user_id', 'user_' + Math.random().toString(36).substr(2, 9));

        // ✅ GET CORRECT TOKEN KEY
        const token = localStorage.getItem('authToken');
        
        console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND');
        console.log('📁 File:', selectedFile.name, selectedFile.size);

        if (!token) {
          setErrorMessage('Not authenticated. Please login first.');
          setAnalysisState('IDLE');
          return;
        }

        const uploadTimer = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(uploadTimer);
              return 90;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const response = await fetch(`${API_URL}/api/analysis/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ CORRECT FORMAT
          },
          body: formData,
        });

        clearInterval(uploadTimer);
        setUploadProgress(100);

        console.log('📥 Response status:', response.status);
        const data = await response.json();
        console.log('📥 Response data:', data);

             if (!response.ok) {
          throw new Error(data?.message || data?.error || 'Upload failed');
        }

        // ✅ Trigger ML
        setAnalysisState('ANALYZING');
        console.log(`📤 Upload complete. Starting ML...`);
        const mlSuccess = await startMLAnalysis(data.analysis_id);
        if (mlSuccess) {
          console.log(`✅ Analysis complete!`);
          setTimeout(() => {
            router.push(`/dashboard/analysis/${data.analysis_id}`);
          }, 2000);
        } else {
          setErrorMessage('Analysis failed');
          setAnalysisState('IDLE');
        }


      } catch (error: any) {
        console.error('❌ Error:', error);
        const errorMsg = error?.message || String(error) || 'Unknown error';
        setErrorMessage(`Upload failed: ${errorMsg}`);
        setAnalysisState('IDLE');
      }
    }
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (errorMessage) {
      setSelectedFile(null);
      setErrorMessage(null);
      return;
    }
    
    if (!selectedFile) {
      event.preventDefault();
      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.click();
    } else if (analysisState === 'IDLE' && !errorMessage) {
      startAnalysisPlaceholder();
    }
  };

  const renderUploadArea = () => {
    if (analysisState !== 'IDLE' && selectedFile) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      
      return (
        <div className="text-left w-full">
          <p className="text-lg font-medium text-gray-800 mb-1">{selectedFile.name}</p>
          
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>{analysisState === 'UPLOADING' ? 'Uploading...' : 'Processing file...'}</span>
            <span>{fileSizeMB} MB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${analysisState === 'UPLOADING' ? uploadProgress : 100}%` }}
            ></div>
          </div>

          {analysisState === 'ANALYZING' && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-800 mb-1">Analyzing frames...</p>
              <p className="text-gray-500">Processing frame {currentFrame} of {totalFrames}.</p>
            </div>
          )}

          <div className="bg-indigo-50 border-l-4 border-indigo-400 text-indigo-700 p-4 mt-4" role="alert">
            <p className="font-semibold">Note:</p>
            <p className="text-sm">Analysis may take 1-3 minutes depending on file size and frame count.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full">
        {errorMessage ? (
          <FileWarning className="w-12 h-12 text-red-500 mb-4" />
        ) : selectedFile ? (
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        ) : (
          <UploadCloud className="w-12 h-12 text-indigo-500 mb-4" />
        )}
        
        {errorMessage ? (
          <p className="text-red-600 font-medium mb-4 text-center">{errorMessage}</p>
        ) : (
          <>
            <p className="text-xl text-gray-700 mb-2">
              {selectedFile ? `File Selected: ${selectedFile.name}` : 'Drop files to analyze'}
            </p>
            <p className="text-gray-500 mb-6">
              {selectedFile ? 'Ready to analyze.' : 'or click to browse from your device'}
            </p>
          </>
        )}

        <div className="flex space-x-2 mb-4">
          {SUPPORTED_FORMATS.map(format => (
            <span key={format} className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
              {format}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-gray-400 mb-4">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>
        
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
          />
          <button
            type="button"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-300"
            onClick={handleButtonClick}
            disabled={analysisState === 'UPLOADING' || analysisState === 'ANALYZING'}
          >
            {errorMessage ? 'Clear File' : selectedFile ? 'Start Analysis' : 'Select File'}
          </button>
        </label>
      </div>
    );
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">New Deepfake Analysis</h2>
        <p className="text-gray-500 mb-10">Upload media files to detect potential deepfakes using AI analysis</p>

        <div
          className={`
            border-2 rounded-xl p-16 text-center bg-white shadow-xl transition-all duration-300 flex justify-center items-center
            ${isDragging && analysisState === 'IDLE' ? 'border-indigo-500 bg-indigo-50 border-solid' : 'border-indigo-200 border-dashed'}
            ${analysisState !== 'IDLE' ? 'p-10' : ''}
          `}
          onDragOver={analysisState === 'IDLE' ? handleDragOver : undefined}
          onDragLeave={analysisState === 'IDLE' ? handleDragLeave : undefined}
          onDrop={analysisState === 'IDLE' ? handleDrop : undefined}
        >
          {renderUploadArea()}
        </div>

        <div className="flex justify-between mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className={`flex flex-col items-center w-[30%] p-4 ${index === 1 ? 'border-l border-r border-gray-100' : ''}`}>
                <Icon className="w-6 h-6 text-indigo-500 mb-3" />
                <h3 className="font-semibold text-gray-800 text-center mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 text-center">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default NewAnalysisContent;
