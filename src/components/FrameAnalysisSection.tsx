// src/components/FrameAnalysisSection.tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Frame {
  id: number;
  label: "FAKE" | "REAL";
  confidence: number;
  imageUrl: string;
}

interface FrameAnalysisSectionProps {
  frames: Frame[];
  totalFrames: number;
  showingFrames: number;
}

const FrameAnalysisSection: React.FC<FrameAnalysisSectionProps> = ({ frames, totalFrames, showingFrames }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Frame Analysis</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {frames.map((frame) => (
          <div key={frame.id} className="relative rounded-md overflow-hidden">
            {/* Image */}
            <img
              src={frame.imageUrl}
              alt={`Frame ${frame.id}`}
              className="w-full h-full object-cover aspect-video"
            />
            
            {/* Label - Positioned on top of image */}
            <div
              className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-white text-xs font-medium ${
                frame.label === "FAKE" ? 'bg-[#D93F3F]' : 'bg-green-600'
              }`}
            >
              Frame {frame.id} &bull; {frame.label} {frame.confidence}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
        <span>Showing {showingFrames} of {totalFrames} frames</span>
        <a href="#" className="flex items-center text-blue-600 hover:underline font-medium">
          View All Frames <ArrowRight size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );
};

export default FrameAnalysisSection;