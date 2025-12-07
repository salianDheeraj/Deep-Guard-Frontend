"use client";
import React from "react";

interface Props {
  imageUrl: string;
  isDeepfake: boolean;
  confidenceScore: number;
  createdAt?: string;
}

const ImageAnalysisSection: React.FC<Props> = ({
  imageUrl,
  isDeepfake,
  confidenceScore,
  createdAt
}) => {
  // Convert backend binary response → Blob → URL
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(imageUrl, { credentials: "include" });
        const blob = await res.blob();
        const localUrl = URL.createObjectURL(blob);
        setResolvedUrl(localUrl);
      } catch (err) {
        console.error("Image fetch failed:", err);
      }
    };

    fetchImage();
  }, [imageUrl]);

  return (
    <div className="flex w-full bg-slate-900/40 rounded-xl p-6 gap-6">

      {/* LEFT SIDE IMAGE */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex justify-center items-center p-4">
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt="Analyzed"
            className="max-h-[350px] max-w-full object-contain rounded-lg"
          />
        ) : (
          <p className="text-gray-400 text-sm">Loading image...</p>
        )}
      </div>

      {/* RIGHT SIDE RESULT */}
      <div className="w-80 text-gray-200 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">Image Analysis</h2>

        <span
          className={`px-4 py-1 rounded-lg text-sm font-semibold mb-3 self-start ${
            isDeepfake ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
          }`}
        >
          {isDeepfake ? "FAKE" : "REAL"}
        </span>

        <p className="text-lg mb-1">Confidence</p>
        <p className="text-4xl font-bold mb-6">
          {Math.round(confidenceScore * 100)}%
        </p>

        <p className="text-sm text-gray-400">
          Analyzed on: {createdAt}
        </p>
      </div>
    </div>
  );
};

export default ImageAnalysisSection;
