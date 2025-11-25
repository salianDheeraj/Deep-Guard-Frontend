"use client";

import React, { useState, useCallback, useMemo, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle,
  Shield,
  Cpu,
  Image as ImageIcon,
  LucideIcon,
  FileWarning,
  Loader2,
  X,
} from "lucide-react";
import FeatureList, { FeatureItem } from "./FeatureList";
import FrameInputModal from "./FrameInputModal";
import UploadArea from "./UploadArea";
import { debug } from "@/lib/logger";

// FeatureItem type now comes from FeatureList component import

type AnalysisState = "IDLE" | "UPLOADING" | "ANALYZING";

const MAX_FILE_SIZE_MB = 10;
const SUPPORTED_FORMATS = ["JPG", "PNG", "MP4"];

const NewAnalysisContent: React.FC = () => {
  const router = useRouter();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("IDLE");
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


  const acceptedFileTypes: string = useMemo(() => {
    return SUPPORTED_FORMATS.map((f) => `.${f.toLowerCase()}`).join(",");
  }, []);

  const features: FeatureItem[] = useMemo(() => [
    { title: "Supported Formats", desc: `Images (JPG, PNG), Video (MP4)`, icon: ImageIcon },
    { title: "Secure Processing", desc: "All files are encrypted and automatically deleted after 30 days", icon: Shield },
    { title: "AI-Powered Detection", desc: "Advanced neural networks analyze each frame for manipulation", icon: Cpu },
  ], []);

  const handleCancelUpload = async () => {
    debug("❌ Cancel Upload clicked");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      debug("❌ Aborted upload via AbortController");
    }

    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
      debug("⏹️ Cleared upload progress timer");
    }

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
      debug("⏹️ Cleared frame animation interval");
    }

    if (uploadedAnalysisIdRef.current) {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        debug(
          `🗑️ Deleting cancelled upload on server: ${uploadedAnalysisIdRef.current}`
        );

        await fetch(
          `${API_URL}/api/analysis/${uploadedAnalysisIdRef.current}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        debug("✅ Cancelled upload deleted from server");
      } catch (err) {
        console.error("❌ Failed to delete cancelled upload:", err);
        debug("❌ Failed to delete cancelled upload on server");
      }

      uploadedAnalysisIdRef.current = null;
    }

    setAnalysisState("IDLE");
    setSelectedFile(null);
    setUploadProgress(0);
    setCurrentFrame(0);
    setTotalFrames(0);
    setFramesToAnalyze(20);
    setErrorMessage(null);
    debug("↩️ Upload state reset after cancel");
  };

  const getVideoFrameCount = (file: File): Promise<number> => {
    debug("🎬 Estimating video frame count for file:", file.name);
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        const fps = video.videoWidth > 0 ? 30 : 24;
        const frameCount = Math.floor(video.duration * fps);
        debug(
          `🎞️ Video metadata loaded. Duration=${video.duration.toFixed(
            2
          )}s, fps≈${fps}, frames≈${frameCount}`
        );
        resolve(frameCount);
      };
      video.onerror = () => {
        debug("⚠️ Failed to load video metadata, falling back to 0 frames");
        resolve(0);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const validateFile = useCallback((file: File | null) => {
    setErrorMessage(null);
    if (!file) {
      debug("⚠️ validateFile called with null file");
      return false;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    debug(
      `📁 Validating file: name="${file.name}", size=${fileSizeMB.toFixed(
        2
      )} MB, type="${file.type}"`
    );

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      const msg = `File size is too high: ${fileSizeMB.toFixed(
        2
      )} MB. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
      setErrorMessage(msg);
      debug("❌ File validation failed (size):", msg);
      return false;
    }

    const fileExtension = file.name.split(".").pop()?.toUpperCase();
    if (!fileExtension || !SUPPORTED_FORMATS.includes(fileExtension)) {
      const msg = `Unsupported file type. Please use ${SUPPORTED_FORMATS.join(
        ", "
      )}.`;
      setErrorMessage(msg);
      debug("❌ File validation failed (extension):", msg);
      return false;
    }

    debug("✅ File validation passed");
    return true;
  }, []);

  const processFiles = (files: FileList) => {
    const file = files[0];
    if (file && validateFile(file)) {
      debug("📥 File accepted from input/drag:", file.name);
      setSelectedFile(file);
    } else {
      debug("🚫 File rejected during processFiles");
      setSelectedFile(null);
    }
    setIsDragging(false);
  };

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!isDragging) debug("🧲 Drag over upload area");
      setIsDragging(true);
    },
    [isDragging]
  );

  const handleDragLeave = useCallback(() => {
    if (isDragging) debug("🧲 Drag left upload area");
    setIsDragging(false);
  }, [isDragging]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    debug("📥 File(s) dropped into upload area");
    processFiles(event.dataTransfer.files);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      debug("📁 File selected via file picker");
      processFiles(event.target.files);
    }
  };

  // Frame input modal is now a separate component

  const startAnalysisPlaceholder = async () => {
    if (!selectedFile || !validateFile(selectedFile)) {
      debug("🚫 startAnalysisPlaceholder aborted: no valid file");
      return;
    }

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    debug("🚀 Starting analysis pipeline", {
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      isImage,
      isVideo,
    });

    setAnalysisState("UPLOADING");
    setUploadProgress(0);

    try {
      // Simulated upload progress
      debug("📊 Simulating upload progress to 100%");
      let done = false;
      uploadTimerRef.current = setInterval(() => {
        setUploadProgress((prev) => {
          const p = prev + Math.random() * 12;
          if (p >= 100) {
            done = true;
            if (uploadTimerRef.current) {
              clearInterval(uploadTimerRef.current);
              uploadTimerRef.current = null;
            }
            debug("✅ Simulated upload progress reached 100%");
            return 100;
          }
          return p;
        });
      }, 250);

      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (done) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

      // REAL upload
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      let uploadEndpoint = "";
      let frameCount = 0;

      if (isVideo) {
        uploadEndpoint = `${API_URL}/api/analysis/upload`;

        frameCount = await getVideoFrameCount(selectedFile);
        setTotalFrames(frameCount || 1);
        debug(
          `🎬 Video upload: frames=${frameCount}, framesToAnalyze=${framesToAnalyze}`
        );

        // If we haven't shown frame modal yet, show it and stop here.
        if (!showFrameInput && frameCount > 0) {
          debug(
            "📝 Showing frame selection modal before upload/ML for video"
          );
          setShowFrameInput(true);
          setAnalysisState("IDLE");
          setUploadProgress(0);
          return;
        }

        formData.append("file", selectedFile);
        formData.append("total_frames", frameCount.toString());
        formData.append("frames_to_analyze", framesToAnalyze.toString());
      } else if (isImage) {
        uploadEndpoint = `${API_URL}/api/analysis/image/upload`;

        frameCount = 1;
        setTotalFrames(1);
        debug("🖼️ Image upload: single frame/image");

  const renderFrameInputModal = () => {
    if (!showFrameInput || !selectedFile) return null;

    const maxFramesToAnalyze = Math.min(200, totalFrames);
    const frameSkipInterval = Math.ceil(totalFrames / (framesToAnalyze || 1));
    const isInvalid = framesToAnalyze > maxFramesToAnalyze || framesToAnalyze < 20;

    const presets = [
      { label: 'Quick', frames: 20, color: 'green' },
      { label: 'Standard', frames: 80, color: 'primary' },
      { label: 'Advanced', frames: 140, color: 'purple' },
      { label: 'Deep', frames: maxFramesToAnalyze, color: 'red' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {/* ✅ Dark Mode Modal */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col border border-gray-100 dark:border-gray-700">

          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-gray-700 p-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              🎬 Analysis Settings
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              How Many Frames to Analyze?
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {/* LIGHT: Blue | DARK: Teal */}
              📊 Total: <span className="font-bold text-blue-600 dark:text-teal-400">{totalFrames}</span> | Max: <span className="font-bold text-blue-600 dark:text-teal-400">{maxFramesToAnalyze}</span>
            </p>

            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Slider:</label>

              <input
                type="range"
                min="20"
                max={maxFramesToAnalyze}
                step="4"
                value={framesToAnalyze}
                onChange={(e) => setFramesToAnalyze(Number(e.target.value))}
                // LIGHT: Accent Blue | DARK: Accent Teal
                className="w-full h-3 bg-gradient-to-r from-green-200 via-blue-300 dark:via-teal-300 to-red-400 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-teal-600"
              />

              <div className="relative mt-2 h-4">
                <div className="absolute left-0 text-xs text-gray-500 dark:text-gray-400 font-semibold" style={{ left: '0%', transform: 'translateX(0%)' }}>
                  <span>20</span>
                </div>
                <div className="absolute text-xs text-gray-500 dark:text-gray-400 font-semibold" style={{ left: `${((80 - 20) / (maxFramesToAnalyze - 20)) * 100}%`, transform: 'translateX(-50%)' }}>
                  <span>80</span>
                </div>
                <div className="absolute text-xs text-gray-500 dark:text-gray-400 font-semibold" style={{ left: `${((140 - 20) / (maxFramesToAnalyze - 20)) * 100}%`, transform: 'translateX(-50%)' }}>
                  <span>140</span>
                </div>
                <div className="absolute text-xs text-gray-500 dark:text-gray-400 font-semibold" style={{ left: '100%', transform: 'translateX(-100%)' }}>
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
                    : 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:shadow-md',
                  // LIGHT: Blue | DARK: Teal
                  primary: isSelected 
                    ? 'bg-blue-600 dark:bg-teal-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-700 text-blue-600 dark:text-teal-400 border-blue-400 dark:border-teal-400 hover:bg-blue-50 dark:hover:bg-teal-900/30 hover:shadow-md',
                  purple: isSelected
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:shadow-md',
                  red: isSelected
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:shadow-md'
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

            {/* LIGHT: Blue Gradient | DARK: Teal Gradient */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-teal-800 rounded-lg p-3 mb-4">
              <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 font-semibold">📊 Summary:</p>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Analyze</p>
                  {/* LIGHT: Blue | DARK: Teal */}
                  <p className="text-2xl font-bold text-blue-600 dark:text-teal-400">{framesToAnalyze}</p>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Max</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-white">{maxFramesToAnalyze}</p>
                </div>
              </div>

              {isInvalid && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-2">
                  <p className="text-xs text-red-700 dark:text-red-400 font-bold">⚠️ Invalid! Enter 20-{maxFramesToAnalyze} (multiples of 4)</p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Skip every <span className="font-bold">{frameSkipInterval}</span> frame (from {totalFrames} total)
              </p>
            </div>

            {/* LIGHT: Blue Box | DARK: Teal Box */}
            <div className="bg-blue-50 dark:bg-teal-900/20 border border-blue-200 dark:border-teal-800 rounded p-2 text-xs text-blue-800 dark:text-teal-300">
              <p className="font-bold mb-1">✅ Example:</p>
              <p>Video: 279 frames → Pick: 100 → AI analyzes exactly 100</p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t dark:border-gray-700 p-4 flex gap-3">
            <button
              onClick={() => {
                setShowFrameInput(false);
                setFramesToAnalyze(20);
                setAnalysisState('IDLE');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition font-medium text-sm"
            >
              ❌ Cancel
            </button>
            <button
              onClick={() => {
                setShowFrameInput(false);
                startAnalysisPlaceholder();
              }}
              disabled={isInvalid}
              // LIGHT: Blue | DARK: Teal
              className={`flex-1 px-4 py-2 rounded-lg transition font-bold text-sm ${isInvalid
                  ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white'
                }`}
            >
              ✅ Start Analysis
            </button>
          </div>
        </div>
      </div>
    );
  };
        formData.append("files", selectedFile);
        formData.append("total_images", "1");
        formData.append("images_to_analyze", "1");
      } else {
        throw new Error("Unsupported file type");
      }

      debug("📡 Upload →", uploadEndpoint);

      const uploadRes = await fetch(uploadEndpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      const uploadData = await uploadRes.json().catch(() => ({}));
      debug("📥 Upload response:", uploadData);

      if (!uploadRes.ok) {
        // Surface backend message to UI for easier debugging
        const backendMsg = uploadData?.message || `Upload failed (${uploadRes.status})`;

        // Specific helpful hint for large image uploads
        if (uploadRes.status === 413) {
          setErrorMessage(`Upload rejected: file too large. Maximum ${MAX_FILE_SIZE_MB}MB.`);
        } else {
          setErrorMessage(backendMsg);
        }

        debug("❌ Upload error details:", { status: uploadRes.status, body: uploadData });

        // If session expired / unauthorized, redirect to login so user can re-authenticate.
        if (uploadRes.status === 401 || String(backendMsg).toLowerCase().includes("session") || String(backendMsg).toLowerCase().includes("auth")) {
          debug("🔒 Session expired detected during upload; redirecting to login");
          setAnalysisState("IDLE");
          setUploadProgress(0);
          setSelectedFile(null);
          router.push("/login");
          throw new Error(backendMsg);
        }

        throw new Error(backendMsg);
      }

      const analysisId =
        uploadData.analysis_id ||
        uploadData.data?.analysis_id ||
        uploadData.id;

      await new Promise((r) => setTimeout(r, 200)); // allow cookie rotation

      if (!analysisId) {
        throw new Error("No analysisId returned");
      }

      uploadedAnalysisIdRef.current = analysisId;
      debug("✅ Upload complete. analysisId:", analysisId);

      // ML phase
      setAnalysisState("ANALYZING");
      setCurrentFrame(0);

      const mlEndpoint = isImage
        ? `${API_URL}/api/ml/images/${analysisId}`
        : `${API_URL}/api/ml/analyze/${analysisId}`;

      debug("🧠 ML →", mlEndpoint);

      if (isVideo) {
        // fake frame animation
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
        }
        frameIntervalRef.current = setInterval(() => {
          setCurrentFrame((prev) => {
            if (prev >= framesToAnalyze) return framesToAnalyze;
            return prev + 1;
          });
        }, 650);
      } else {
        setCurrentFrame(1);
      }

      let mlRes: Response;

      if (isVideo) {
        mlRes = await fetch(mlEndpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total_frames: frameCount,
            frames_to_analyze: framesToAnalyze,
          }),
        });
      } else {
        // IMAGE: no body, backend pulls from storage
        mlRes = await fetch(mlEndpoint, {
          method: "POST",
          credentials: "include",
        });
      }

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
      setCurrentFrame(isImage ? 1 : framesToAnalyze);

      const mlData = await mlRes.json();
      debug("🧠 ML result:", mlData);

      if (!mlRes.ok || !mlData.success) {
        throw new Error(mlData.message || "ML failed");
      }

      uploadedAnalysisIdRef.current = null;
      debug("✅ ML successful. Redirecting to analysis page...");

      await new Promise((r) => setTimeout(r, 800));
      router.push(`/dashboard/analysis/${analysisId}`);
    } catch (error: any) {
      console.error("❌ Error:", error);
      debug("❌ Analysis pipeline error:", error?.message || String(error));

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }

      setAnalysisState("IDLE");
      setErrorMessage(error.message || "Something went wrong");

      if (uploadedAnalysisIdRef.current) {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          debug(
            `🗑️ Cleaning up failed analysis on server: ${uploadedAnalysisIdRef.current}`
          );
          await fetch(
            `${API_URL}/api/analysis/${uploadedAnalysisIdRef.current}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          debug("✅ Cleanup complete");
        } catch (err) {
          console.error("❌ Failed to cleanup analysis on error:", err);
          debug("❌ Cleanup request failed");
        }
      }

      uploadedAnalysisIdRef.current = null;
    }
  };

  const handleButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (errorMessage) {
      debug("🧹 Clearing error and selected file via button click");
      setSelectedFile(null);
      setErrorMessage(null);
      return;
    }

    if (!selectedFile) {
      debug("📂 No file selected, opening file picker");
      event.preventDefault();
      const fileInput =
        document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.click();
    } else if (analysisState === "IDLE" && !errorMessage) {
      debug("🚀 Starting analysis from button click");
      void startAnalysisPlaceholder();
    }
  };

  const renderUploadArea = () => {
    if (analysisState !== 'IDLE' && selectedFile) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);

      return (
        <div className="text-left w-full">
          <p className="text-lg font-medium text-gray-800 dark:text-white mb-1">{selectedFile.name}</p>

          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{analysisState === 'UPLOADING' ? 'Uploading...' : 'Processing file...'}</span>
            <span>{fileSizeMB} MB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
            {/* LIGHT: Blue | DARK: Teal */}
            <div
              className="bg-blue-600 dark:bg-teal-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${analysisState === 'UPLOADING' ? uploadProgress : 100}%` }}
            ></div>
          </div>

          {analysisState === 'UPLOADING' && (
            <div className="flex flex-col items-center justify-center py-6">
              {/* LIGHT: Blue | DARK: Teal */}
              <Loader2 className="w-10 h-10 text-blue-500 dark:text-teal-500 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Uploading file...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Please wait while we upload your file</p>

              <button
                onClick={handleCancelUpload}
                // LIGHT: Red | DARK: Orange (Consistent "Delete" Logic)
                className="px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg transition font-medium text-sm flex items-center gap-2"
              >
                <X size={16} />
                Cancel Upload
              </button>
            </div>
          )}

          {analysisState === 'ANALYZING' && (
            <div ref={analysisContainerRef} className="flex flex-col items-center justify-center py-6">
              {/* LIGHT: Blue | DARK: Teal */}
              <Loader2 className="w-10 h-10 text-blue-500 dark:text-teal-500 animate-spin mb-4" />
              <p className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Analyzing frames...</p>
              <p className="text-gray-500 dark:text-gray-400">Processing frame <span className="frame-counter">{currentFrame}</span> of {framesToAnalyze}.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Total frames: {totalFrames}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 font-medium">⏳ Analysis in progress - please do not close this page</p>
            </div>
          )}

          {/* LIGHT: Blue | DARK: Teal */}
          <div className="bg-blue-50 dark:bg-teal-900/20 border-l-4 border-blue-400 dark:border-teal-600 text-blue-700 dark:text-teal-300 p-4 mt-4" role="alert">
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
          // LIGHT: Red | DARK: Orange (Consistent Error Logic)
          <FileWarning className="w-12 h-12 text-red-500 dark:text-orange-500 mb-4" />
        ) : selectedFile ? (
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        ) : (
          // LIGHT: Blue | DARK: Teal
          <UploadCloud className="w-12 h-12 text-blue-500 dark:text-teal-500 mb-4" />
        )}

        {errorMessage ? (
          // LIGHT: Red | DARK: Orange
          <p className="text-red-600 dark:text-orange-400 font-medium mb-4 text-center">{errorMessage}</p>
        ) : (
          <>
            <p className="text-xl text-gray-700 dark:text-gray-200 mb-2">
              {selectedFile ? `File Selected: ${selectedFile.name}` : 'Drop files to analyze'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {selectedFile ? 'Ready to analyze.' : 'or click to browse from your device'}
            </p>
          </>
        )}

        <div className="flex space-x-2 mb-4">
          {SUPPORTED_FORMATS.map(format => (
            <span key={format} className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600">
              {format}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Maximum file size: {MAX_FILE_SIZE_MB}MB</p>

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
              className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition duration-150 flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={analysisState === 'UPLOADING' || analysisState === 'ANALYZING'}
              // LIGHT: Blue | DARK: Teal
              className="px-8 py-3 bg-blue-600 dark:bg-teal-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-teal-700 transition duration-150 shadow-md disabled:bg-blue-300 dark:disabled:bg-teal-300"
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
              // LIGHT: Blue | DARK: Teal
              className="px-8 py-3 bg-blue-600 dark:bg-teal-600 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-teal-700 transition duration-150 shadow-md"
              onClick={handleButtonClick}
            >
              Select File
            </button>
          </label>
        )}
      </div>
    );
  };
  // Upload area and frame modal moved to separate components to keep file modular

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 p-10 transition-colors">
      <FrameInputModal
        show={showFrameInput}
        selectedFile={selectedFile}
        totalFrames={totalFrames}
        framesToAnalyze={framesToAnalyze}
        setFramesToAnalyze={setFramesToAnalyze}
        setShow={setShowFrameInput}
        startAnalysis={startAnalysisPlaceholder}
        setAnalysisState={setAnalysisState}
      />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          New Deepfake Analysis
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10">
          Upload media files to detect potential deepfakes using AI analysis
        </p>

        <div
          className={`
            border-2 rounded-xl p-16 text-center bg-white dark:bg-slate-800 shadow-xl transition-all duration-300 flex justify-center items-center
            ${isDragging && analysisState === 'IDLE'
              // LIGHT: Blue | DARK: Teal
              ? 'border-blue-500 bg-blue-50 dark:border-teal-500 dark:bg-teal-900/30 border-solid'
              : 'border-blue-200 dark:border-teal-800/50 border-dashed'}
            ${analysisState !== 'IDLE' ? 'p-10' : ''}
            ${
              isDragging && analysisState === "IDLE"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 border-solid"
                : "border-indigo-200 dark:border-indigo-800/50 border-dashed"
            }
            ${analysisState !== "IDLE" ? "p-10" : ""}
          `}
          onDragOver={analysisState === "IDLE" ? handleDragOver : undefined}
          onDragLeave={analysisState === "IDLE" ? handleDragLeave : undefined}
          onDrop={analysisState === "IDLE" ? handleDrop : undefined}
        >
          <UploadArea
            analysisState={analysisState}
            selectedFile={selectedFile}
            errorMessage={errorMessage}
            uploadProgress={uploadProgress}
            currentFrame={currentFrame}
            framesToAnalyze={framesToAnalyze}
            totalFrames={totalFrames}
            handleCancelUpload={handleCancelUpload}
            handleButtonClick={handleButtonClick}
            handleFileChange={handleFileChange}
            acceptedFileTypes={acceptedFileTypes}
            setSelectedFile={setSelectedFile}
            setErrorMessage={setErrorMessage}
            setFramesToAnalyze={setFramesToAnalyze}
            MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
            SUPPORTED_FORMATS={SUPPORTED_FORMATS}
          />
        </div>

        <div className="flex justify-between mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className={`flex flex-col items-center w-[30%] p-4 ${index === 1 ? 'border-l border-r border-gray-100 dark:border-gray-700' : ''}`}>
                {/* LIGHT: Blue | DARK: Teal */}
                <Icon className="w-6 h-6 text-blue-500 dark:text-teal-500 mb-3" />
                <h3 className="font-semibold text-gray-800 dark:text-white text-center mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{feature.desc}</p>
              </div>
            );
          })}
        </div>
        <FeatureList features={features} />
      </div>
    </main>
  );
};

export default NewAnalysisContent;
