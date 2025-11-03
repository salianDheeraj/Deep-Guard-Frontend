// src/components/DeepfakeAlertCard.tsx
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DeepfakeAlertCardProps {
  isDeepfake: boolean;
  confidence: number;
}

const DeepfakeAlertCard: React.FC<DeepfakeAlertCardProps> = ({ isDeepfake, confidence }) => {
  const bgColor = isDeepfake ? 'bg-[#D93F3F]' : 'bg-green-600'; // EXACT red from image
  const label = isDeepfake ? "FAKE" : "REAL";
  const message = isDeepfake ? "Deepfake manipulation detected" : "No deepfake manipulation detected";

  return (
    <div className={`rounded-lg p-6 text-white ${bgColor} flex items-center justify-between shadow-md`}>
      <div>
        <h2 className="text-4xl font-extrabold flex items-center space-x-2">
          <span>{label}</span>
          <AlertTriangle size={28} className="text-white" />
        </h2>
        <p className="text-lg mt-1">{message}</p>
        <p className="text-sm flex items-center space-x-1 mt-2 opacity-90">
          <Info size={16} />
          <span>Confidence represents model certainty, not absolute proof</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-6xl font-bold">{confidence}%</span>
        <span className="text-sm mt-1 opacity-90">Overall Confidence</span>
      </div>
    </div>
  );
};

export default DeepfakeAlertCard;