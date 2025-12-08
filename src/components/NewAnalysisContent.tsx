"use client";

import React, { useState, useCallback, useMemo, useRef, DragEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Video,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import FeatureList, { FeatureItem } from "./FeatureList";
import FrameInputModal from "./FrameInputModal";
import UploadArea from "./UploadArea";
import { debug } from "@/lib/logger";

// FeatureItem type now comes from FeatureList component import

type AnalysisState = "IDLE" | "UPLOADING" | "ANALYZING";
type AnalysisType = "VIDEO" | "IMAGE";

const MAX_FILE_SIZE_MB = 10;

const NewAnalysisContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL if present (e.g. ?type=IMAGE)
  const [selectedType, setSelectedType] = useState<AnalysisType | null>(() => {
    const type = searchParams.get('type')?.toUpperCase();
    if (type === 'IMAGE') return 'IMAGE';
    if (type === 'VIDEO') return 'VIDEO';
    return null;
  });

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

  // Dynamic config based on selection
  const config = useMemo(() => {
    if (selectedType === 'IMAGE') {
      return {
        supportedFormats: ["JPG", "PNG", "JPEG"],
        extensions: [".jpg", ".png", ".jpeg"],
        label: "Image",
        icon: ImageIcon
      };
    }
    return {
      supportedFormats: ["MP4"],
      extensions: [".mp4"],
      label: "Video",
      icon: Video
    };
  }, [selectedType]);

  const acceptedFileTypes: string = useMemo(() => {
    return config.extensions.join(",");
  }, [config]);

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

    // Use dynamic config.supportedFormats based on selectedType (Video vs Image)
    // Note: 'config' is not directly accessible in this callback due to dependency chain
    // We should use the selectedType ref or pass it in. 
    // Simplified: Check standard formats but logic below ensures type safety via accept attribute too.
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (selectedType === 'VIDEO' && !isVideo) {
      setErrorMessage("Please select a valid Video file (MP4).");
      return false;
    }
    if (selectedType === 'IMAGE' && !isImage) {
      setErrorMessage("Please select a valid Image file (JPG, PNG).");
      return false;
    }

    // Basic extension check
    // Actually we can just trust the 'selectedType' logic primarily.
    return true;
  }, [selectedType]);

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

  // -------------------------------------------------------------
  // RENDER: Selection Screen
  // -------------------------------------------------------------
  if (!selectedType) {
    return (
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950 p-10 transition-colors">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
            Choose Analysis Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* VIDEO CARD */}
            <div
              onClick={() => setSelectedType('VIDEO')}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 dark:bg-gradient-to-br dark:from-slate-800 dark:to-cyan-900/20 rounded-2xl p-8 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl border border-gray-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-500"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-cyan-400 group-hover:bg-blue-600 dark:group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:text-white transition-colors duration-300">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyze Video</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Detect deepfakes in video files. Supports MP4 format.
              </p>
              <div className="flex items-center text-blue-600 dark:text-cyan-400 font-medium">
                Select Video <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* IMAGE CARD */}
            <div
              onClick={() => setSelectedType('IMAGE')}
              className="group relative overflow-hidden bg-white dark:bg-slate-800 dark:bg-gradient-to-br dark:from-slate-800 dark:to-purple-900/20 rounded-2xl p-8 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl border border-gray-100 dark:border-slate-700 hover:border-pink-500 dark:hover:border-purple-500"
            >
              <div className="w-16 h-16 bg-pink-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-pink-600 dark:text-purple-400 group-hover:bg-pink-600 dark:group-hover:bg-purple-600 group-hover:text-white dark:group-hover:text-white transition-colors duration-300">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyze Image</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Check photos for AI manipulation. Supports JPG, PNG.
              </p>
              <div className="flex items-center text-pink-600 dark:text-purple-400 font-medium">
                Select Image <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="mt-12 opacity-80">
            <FeatureList features={features} />
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Upload Screen (Specific Type)
  // -------------------------------------------------------------
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
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setSelectedType(null);
              setSelectedFile(null);
              setErrorMessage(null);
            }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              {selectedType === 'VIDEO' ? <Video className="w-8 h-8 text-cyan-500" /> : <ImageIcon className="w-8 h-8 text-purple-500" />}
              Analyze {config.label}
            </h2>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-10 ml-12">
          Upload {config.label.toLowerCase()} files to detect potential deepfakes. Supported: {config.supportedFormats.join(', ')}
        </p>

        <div
          className={`
            border-2 rounded-xl p-16 text-center bg-white dark:bg-slate-800 shadow-xl transition-all duration-300 flex justify-center items-center
            ${isDragging && analysisState === "IDLE"
              ? selectedType === 'VIDEO'
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border-solid"
                : "border-purple-500 bg-purple-50 dark:bg-purple-900/30 border-solid"
              : selectedType === 'VIDEO'
                ? "border-cyan-200 dark:border-cyan-800/50 border-dashed"
                : "border-purple-200 dark:border-purple-800/50 border-dashed"
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
            SUPPORTED_FORMATS={config.supportedFormats}
          />
        </div>

        <div className="mt-10 [&_h3]:dark:text-white">
          <FeatureList features={features} />
        </div>
      </div>
    </main>
  );
};

export default NewAnalysisContent;