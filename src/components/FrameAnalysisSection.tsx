'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, Download, X } from 'lucide-react';
import JSZip from 'jszip';

import styles from "@/styles/FrameAnalysis.module.css";

interface FrameAnalysisSectionProps {
  analysisId: string;
  frameWiseConfidences: number[];
  annotatedFramesPath: string;
  totalFrames: number;
  averageConfidence: number;
}

interface FrameData {
  id: number;
  label: string;
  confidence: number;
  isFake: boolean;
  url?: string;
}

const FrameAnalysisSection: React.FC<FrameAnalysisSectionProps> = ({
  analysisId,
  frameWiseConfidences = [],
  annotatedFramesPath,
  totalFrames,
  averageConfidence,
}) => {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 🚨 CRITICAL FIX: Use empty string to leverage Next.js Rewrite Proxy
  const API_URL = "";

  // Load frames & images
  useEffect(() => {
    const objectUrls: string[] = [];

    const loadFrames = async () => {
      try {
        setLoading(true);

        const framesData: FrameData[] = frameWiseConfidences.map((confidence, index) => {
          const isFake = confidence >= 0.5;
          return {
            id: index,
            label: isFake ? 'FAKE' : 'REAL',
            confidence: isFake
              ? Math.round(confidence * 100)
              : Math.round((1 - confidence) * 100),
            isFake,
          };
        });

        if (annotatedFramesPath) {
          try {
            // ✅ FIX: Use relative path (empty API_URL)
            const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
              method: "GET",
              credentials: "include", // Cookie is now sent automatically by browser via Proxy
            });

            if (response.ok) {
              const zipBlob = await response.blob();
              setReportBlob(zipBlob);

              const jszip = new JSZip();
              const zipData = await jszip.loadAsync(zipBlob);

              for (const [filename, file] of Object.entries(zipData.files)) {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
                if (isImage && !file.dir) {
                  const match = filename.match(/(\d+)(?!.*\d)/);
                  const idx = match ? parseInt(match[1], 10) : null;

                  if (idx !== null && idx >= 0 && idx < framesData.length) {
                    const imageBlob = await file.async('blob');
                    const url = URL.createObjectURL(imageBlob);
                    objectUrls.push(url);
                    framesData[idx].url = url;
                  }
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ Could not load images from ZIP:', err);
          }
        }

        setFrames(framesData.sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    loadFrames();

    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [analysisId, frameWiseConfidences, annotatedFramesPath]);

  // Download ZIP
  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      let blobToUse = reportBlob;

      if (!blobToUse) {
        // ✅ FIX: Use relative path here too
        const response = await fetch(`${API_URL}/api/analysis/${analysisId}/download`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error('Failed to download report');
        blobToUse = await response.blob();
        setReportBlob(blobToUse);
      }

      const url = window.URL.createObjectURL(blobToUse);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_${analysisId}_report.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('❌ Download error:', err);
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Modal logic
  const openModal = (imageUrl: string) => setSelectedImageUrl(imageUrl);
  const closeModal = useCallback(() => setSelectedImageUrl(null), []);

  const handleOverlayClick = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => event.key === 'Escape' && closeModal();

    if (selectedImageUrl) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('mousedown', handleOverlayClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleOverlayClick);
    };
  }, [selectedImageUrl, closeModal, handleOverlayClick]);

  const getDisplayAverageConfidence = () =>
    averageConfidence >= 0.5
      ? (averageConfidence * 100).toFixed(2)
      : ((1 - averageConfidence) * 100).toFixed(2);

  if (loading) {
    return (
      <div className={`${styles.container} ${styles.loadingContainer}`}>
        <h3 className={styles.title}>Frame Analysis</h3>
        <div className={styles.loadingContent}>
          <Loader className={styles.loadingIcon} />
          <p className={styles.loadingText}>Loading frames...</p>
        </div>
      </div>
    );
  }

  if (!frameWiseConfidences?.length) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Frame Analysis</h3>
        <div className={styles.emptyContent}>
          <p>No frame data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Frame Analysis</h3>
          <p className={styles.subTitle}>
            Average Confidence: {getDisplayAverageConfidence()}%
          </p>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloading || !reportBlob}
          className={styles.downloadButton}
        >
          {downloading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> <span className="hidden sm:inline">Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download Report</span>
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className={styles.gridContainer}>
        <div className={styles.gridLayout}>
          {frames.map((frame) => (
            <div key={frame.id} className={styles.card}>
              <div
                className={`${styles.imageWrapper} ${frame.isFake ? styles.fakeBorder : styles.realBorder
                  }`}
              >
                {frame.url ? (
                  <img
                    src={frame.url}
                    alt={`Frame ${frame.id + 1}`}
                    className={styles.image}
                    onClick={() => openModal(frame.url!)}
                  />
                ) : (
                  <div
                    className={`${styles.noImage} ${frame.isFake ? styles.fakeBg : styles.realBg
                      }`}
                  >
                    <span className={styles.noImageText}>No image</span>
                  </div>
                )}
              </div>

              <div
                className={`${styles.cardFooter} ${frame.isFake
                  ? styles.fakeFooter
                  : styles.realFooter
                  }`}
              >
                <span>Frame {frame.id + 1}: {frame.label}</span>
                <span>{frame.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footerTotal}>Total: {frames.length} frames</div>

      {/* Modal */}
      {selectedImageUrl && (
        <div className={styles.modalOverlay}>
          <div ref={modalRef} className={styles.modalContent}>
            <button
              onClick={closeModal}
              className={styles.closeButton}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImageUrl}
              alt="Enlarged Frame"
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameAnalysisSection;