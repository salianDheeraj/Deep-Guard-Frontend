// src/components/NewAnalysisContent.tsx
"use client";
import { useNewAnalysisAnimation } from '@/hooks/useNewAnalysisAnimation ';
import React, { useState, useCallback, useMemo, useRef, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, Shield, Cpu, Image as ImageIcon, LucideIcon, FileWarning, Loader2, X } from 'lucide-react';

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
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [framesToAnalyze, setFramesToAnalyze] = useState<number>(20);
  const [showFrameInput, setShowFrameInput] = useState<boolean>(false);
  const analysisContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const uploadTimerRef = useRef<NodeJS.Timeout | null>(null);
  const uploadedAnalysisIdRef = useRef<string | null>(null);

  useNewAnalysisAnimation(analysisContainerRef, analysisState === 'ANALYZING');

  const acceptedFileTypes: string = useMemo(() => {
    return SUPPORTED_FORMATS.map(f => `.${f.toLowerCase()}`).join(',');
  }, []);
  
  const features: FeatureItem[] = useMemo(() => [
    { title: "Supported Formats", desc: `Images (JPG, PNG), Video (MP4)`, icon: ImageIcon },
    { title: "Secure Processing", desc: "All files are encrypted and automatically deleted after 30 days", icon: Shield },
    { title: "AI-Powered Detection", desc: "Advanced neural networks analyze each frame for manipulation", icon: Cpu },
  ], []);

  const handleCancelUpload = async () => {
    console.log('❌ Cancel Upload clicked');
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('❌ Aborted upload');
    }
    
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
    }

    if (uploadedAnalysisIdRef.current) {
      try {
        const token = localStorage.getItem('authToken');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        console.log(`🗑️ Deleting cancelled upload: ${uploadedAnalysisIdRef.current}`);
        
        await fetch(`${API_URL}/api/analysis/${uploadedAnalysisIdRef.current}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Cancelled upload deleted from Supabase');
      } catch (err) {
        console.error('❌ Failed to delete cancelled upload:', err);
      }
      
      uploadedAnalysisIdRef.current = null;
    }

    setAnalysisState('IDLE');
    setSelectedFile(null);
    setUploadProgress(0);
    setCurrentFrame(0);
    setTotalFrames(0);
    setFramesToAnalyze(20);
    setErrorMessage(null);
    console.log('❌ Upload cancelled by user');
  };

  const getVideoFrameCount = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const fps = video.videoWidth > 0 ? 30 : 24;
        const frameCount = Math.floor(video.duration * fps);
        resolve(frameCount);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

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

  const startMLAnalysis = async (analysisId: string, frameCount: number) => {
    try {
      if (!analysisId) {
        console.error('❌ analysisId is required');
        return null;
      }

      const token = localStorage.getItem('authToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log(`🔍 Starting ML analysis: ${analysisId}`);
      console.log(`🎬 Total frames: ${frameCount}`);
      console.log(`📊 Frames to analyze: ${framesToAnalyze}`);

      frameIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= framesToAnalyze) {
            return framesToAnalyze;
          }
          return prev + 1;
        });
      }, 650);

      const response = await fetch(`${API_URL}/api/ml/analyze/${analysisId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          total_frames: frameCount,
          frames_to_analyze: framesToAnalyze
        }),
      });

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      setCurrentFrame(framesToAnalyze);

      console.log(`📊 Response status: ${response.status}`);
      const data = await response.json();
      console.log(`📥 Response data:`, data);

      if (!response.ok) {
        console.error('❌ ML error:', data.message || data);
        return null;
      }

      console.log(`✅ ML completed:`, data.data);

      return {
        success: true,
        is_deepfake: data.data.is_deepfake,
        confidence_score: data.data.confidence_score,
      };

    } catch (error: any) {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      console.error('❌ ML error:', error);
      return null;
    }
  };

  const renderFrameInputModal = () => {
    if (!showFrameInput || !selectedFile) return null;

    const maxFramesToAnalyze = Math.min(200, totalFrames);
    const frameSkipInterval = Math.ceil(totalFrames / (framesToAnalyze || 1));
    const isInvalid = framesToAnalyze > maxFramesToAnalyze || framesToAnalyze < 20;
    
    const presets = [
      { label: 'Quick', frames: 20, color: 'green' },
      { label: 'Standard', frames: 80, color: 'blue' },
      { label: 'Advanced', frames: 140, color: 'purple' },
      { label: 'Deep', frames: maxFramesToAnalyze, color: 'red' }
    ];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col">
          
          <div className="sticky top-0 bg-white border-b p-6">
            <h3 className="text-2xl font-bold text-gray-800">
              🎬 Analysis Settings
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How Many Frames to Analyze?
            </label>
            <p className="text-xs text-gray-500 mb-4">
              📊 Total: <span className="font-bold text-indigo-600">{totalFrames}</span> | Max: <span className="font-bold text-indigo-600">{maxFramesToAnalyze}</span>
            </p>

            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 mb-2">Slider:</label>
              
              <input
                type="range"
                min="20"
                max={maxFramesToAnalyze}
                step="4"
                value={framesToAnalyze}
                onChange={(e) => setFramesToAnalyze(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-200 via-blue-300 to-red-400 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              
              <div className="relative mt-2 h-4">
                <div className="absolute left-0 text-xs text-gray-500 font-semibold" style={{ left: '0%', transform: 'translateX(0%)' }}>
                  <span>20</span>
                </div>
                <div className="absolute text-xs text-gray-500 font-semibold" style={{ left: `${((80 - 20) / (maxFramesToAnalyze - 20)) * 100}%`, transform: 'translateX(-50%)' }}>
                  <span>80</span>
                </div>
                <div className="absolute text-xs text-gray-500 font-semibold" style={{ left: `${((140 - 20) / (maxFramesToAnalyze - 20)) * 100}%`, transform: 'translateX(-50%)' }}>
                  <span>140</span>
                </div>
                <div className="absolute text-xs text-gray-500 font-semibold" style={{ left: '100%', transform: 'translateX(-100%)' }}>
                  <span>200</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {presets.map((preset) => {
                const isSelected = framesToAnalyze === preset.frames;
                const colorClasses = {
                  green: isSelected 
                    ? 'bg-green-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-green-600 border-green-400 hover:bg-green-50 hover:shadow-md',
                  blue: isSelected 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-blue-600 border-blue-400 hover:bg-blue-50 hover:shadow-md',
                  purple: isSelected 
                    ? 'bg-purple-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-purple-600 border-purple-400 hover:bg-purple-50 hover:shadow-md',
                  red: isSelected 
                    ? 'bg-red-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-red-600 border-red-400 hover:bg-red-50 hover:shadow-md'
                };

                return (
                  <button
                    key={preset.label}
                    onClick={() => setFramesToAnalyze(preset.frames)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 
                      font-bold cursor-pointer active:scale-95
                      ${colorClasses[preset.color as keyof typeof colorClasses]}
                    `}
                  >
                    <p className="text-lg font-bold mb-2 uppercase">{preset.label}</p>
                    <div className="text-xs opacity-70">
                      <span className="font-semibold">{preset.frames}</span>
                      <span className="ml-1">frames</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-3 mb-4">
              <p className="text-gray-600 text-xs mb-2 font-semibold">📊 Summary:</p>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-gray-500">Analyze</p>
                  <p className="text-2xl font-bold text-indigo-600">{framesToAnalyze}</p>
                </div>
                <div className="bg-white rounded p-2 text-center">
                  <p className="text-xs text-gray-500">Max</p>
                  <p className="text-2xl font-bold text-gray-600">{maxFramesToAnalyze}</p>
                </div>
              </div>

              {isInvalid && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                  <p className="text-xs text-red-700 font-bold">⚠️ Invalid! Enter 20-{maxFramesToAnalyze} (multiples of 4)</p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Skip every <span className="font-bold">{frameSkipInterval}</span> frame (from {totalFrames} total)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
              <p className="font-bold mb-1">✅ Example:</p>
              <p>Video: 279 frames → Pick: 100 → AI analyzes exactly 100</p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
            <button
              onClick={() => {
                setShowFrameInput(false);
                setFramesToAnalyze(20);
                setAnalysisState('IDLE');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              ❌ Cancel
            </button>
            <button
              onClick={() => {
                setShowFrameInput(false);
                startAnalysisPlaceholder();
              }}
              disabled={isInvalid}
              className={`flex-1 px-4 py-2 rounded-lg transition font-bold text-sm ${
                isInvalid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              ✅ Start Analysis
            </button>
          </div>
        </div>
      </div>
    );
  };

 const startAnalysisPlaceholder = async () => {
  if (selectedFile && validateFile(selectedFile)) {
    setAnalysisState('UPLOADING');
    setUploadProgress(0);

    try {
      let frameCount = 0;
      if (selectedFile.type.startsWith('video')) {
        frameCount = await getVideoFrameCount(selectedFile);
        console.log(`🎬 Detected frames: ${frameCount}`);
        
        if (frameCount > 0 && !showFrameInput) {
          setTotalFrames(frameCount);
          setShowFrameInput(true);
          return;
        }
      }
      setTotalFrames(frameCount || 1);

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setErrorMessage('Not authenticated. Please login first.');
        setAnalysisState('IDLE');
        return;
      }

      // ✅ STEP 1: Simulate upload progress bar to 100% FIRST
      console.log('📊 Simulating upload progress...');
      
      let progressComplete = false;
      uploadTimerRef.current = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
            progressComplete = true;
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // ✅ STEP 2: Wait for progress bar to reach 100%
      await new Promise<void>((resolve) => {
        const checkProgress = setInterval(() => {
          if (progressComplete || !uploadTimerRef.current) {
            clearInterval(checkProgress);
            resolve();
          }
        }, 100);
      });

      console.log('✅ Progress bar reached 100%, now uploading to backend...');

      // ✅ STEP 3: NOW actually upload to backend/Supabase
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', 'user_' + Math.random().toString(36).substr(2, 9));
      formData.append('total_frames', frameCount.toString());
      formData.append('frames_to_analyze', framesToAnalyze.toString());

      console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND');
      console.log('📁 File:', selectedFile.name, selectedFile.size);
      console.log('📊 Frames to analyze:', framesToAnalyze);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const response = await fetch(`${API_URL}/api/analysis/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: abortControllerRef.current?.signal,
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Upload failed');
      }

      const analysisId = data.analysis_id || data.id || data.data?.analysis_id;
      uploadedAnalysisIdRef.current = analysisId;

      setAnalysisState('ANALYZING');
      setCurrentFrame(0);
      console.log(`📤 Upload complete. Starting ML...`);
      console.log(`📋 Analysis ID: ${analysisId}`);
      console.log(`🎬 Frame count: ${frameCount}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`⏱️ Calling ML endpoint now...`);
      
      const mlSuccess = await startMLAnalysis(analysisId, frameCount);

      console.log(`📊 mlSuccess result:`, mlSuccess);

      if (mlSuccess && mlSuccess.success && analysisId) {
        console.log(`✅ Analysis complete! Confidence: ${mlSuccess.confidence_score}`);
        console.log(`🎯 Redirecting to: /dashboard/analysis/${analysisId}`);
        
        uploadedAnalysisIdRef.current = null;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push(`/dashboard/analysis/${analysisId}`);
      } else {
        console.error(`❌ ML analysis failed or incomplete`);
        setErrorMessage('Analysis failed or incomplete. Please try again.');
        setAnalysisState('IDLE');
        
        if (analysisId) {
          try {
            await fetch(`${API_URL}/api/analysis/${analysisId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('🗑️ Deleted failed analysis');
          } catch (err) {
            console.error('Failed to delete failed analysis:', err);
          }
        }
        uploadedAnalysisIdRef.current = null;
      }

    } catch (error: any) {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
      
      if (error.name === 'AbortError') {
        console.log('❌ Upload was cancelled');
        setAnalysisState('IDLE');
        setSelectedFile(null);
        setUploadProgress(0);
        setCurrentFrame(0);
        setTotalFrames(0);
        setFramesToAnalyze(20);
        setErrorMessage(null);
        return;
      }
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

          {analysisState === 'UPLOADING' && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-800 mb-1">Uploading file...</p>
              <p className="text-sm text-gray-500 mb-4">Please wait while we upload your file</p>
              
              <button
                onClick={handleCancelUpload}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center gap-2"
              >
                <X size={16} />
                Cancel Upload
              </button>
            </div>
          )}

          {analysisState === 'ANALYZING' && (
            <div ref={analysisContainerRef} className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-800 mb-1">Analyzing frames...</p>
              <p className="text-gray-500">Processing frame <span className="frame-counter">{currentFrame}</span> of {framesToAnalyze}.</p>
              <p className="text-xs text-gray-400 mt-2">Total frames: {totalFrames}</p>
              <p className="text-xs text-amber-600 mt-4 font-medium">⏳ Analysis in progress - please do not close this page</p>
            </div>
          )}

          <div className="bg-indigo-50 border-l-4 border-indigo-400 text-indigo-700 p-4 mt-4" role="alert">
            <p className="font-semibold">Note:</p>
            <p className="text-sm">
              {analysisState === 'UPLOADING' 
                ? 'You can cancel the upload before analysis begins.' 
                : 'Analysis may take 1-3 minutes. Once started, it cannot be cancelled.'}
            </p>
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
        
        {selectedFile ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setErrorMessage(null);
                setFramesToAnalyze(20);
                setTotalFrames(0);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={analysisState === 'UPLOADING' || analysisState === 'ANALYZING'}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md disabled:bg-indigo-300"
            >
              Start Analysis
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={acceptedFileTypes}
            />
            <button
              type="button"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
              onClick={handleButtonClick}
            >
              Select File
            </button>
          </label>
        )}
      </div>
    );
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-10">
      {renderFrameInputModal()}

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
