// src/components/DeepfakeAlertCard.tsx
import React from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface DeepfakeAlertCardProps {
  isDeepfake: boolean;
  confidence: number;
  framesAnalyzed: number;
  totalFrames: number;
}

const DeepfakeAlertCard: React.FC<DeepfakeAlertCardProps> = ({ 
  isDeepfake, confidence, framesAnalyzed, totalFrames 
}) => {
  const bgColor = isDeepfake ? 'bg-[#D93F3F]' : 'bg-green-600';
  const label = isDeepfake ? "FAKE" : "REAL";
  const message = isDeepfake ? "Deepfake manipulation detected" : "No deepfake manipulation detected";
  
  const confidencePercent = confidence * 100;
  // Format confidence: remove decimal if it's .0, otherwise show one decimal place.
  const formattedConfidence = (confidencePercent % 1 === 0) 
    ? confidencePercent.toFixed(0) 
    : confidencePercent.toFixed(1);

  return (
    <div className={`rounded-lg p-6 text-white ${bgColor} flex items-center justify-between shadow-md`}>
      <div>
        <h2 className="text-4xl font-extrabold flex items-center space-x-2">
          <span>{label}</span>
          {isDeepfake ? (
            <AlertTriangle size={28} className="text-white" />
          ) : (
            <CheckCircle size={28} className="text-white" />
          )}
        </h2>
        <p className="text-lg mt-1">{message}</p>
        <p className="text-sm flex items-center space-x-1 mt-2 opacity-90">
          <Info size={16} />
          <span>Confidence represents model certainty, not absolute proof</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        {/* Use the new formattedConfidence */}
        <span className="text-6xl font-bold">{formattedConfidence}%</span>
        <span className="text-sm mt-1 opacity-90">Overall Confidence</span>
      </div>
    </div>
  );
};

export default DeepfakeAlertCard;