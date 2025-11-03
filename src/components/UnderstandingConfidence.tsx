// src/components/UnderstandingConfidence.tsx
import React from 'react';
import { Info } from 'lucide-react';

const UnderstandingConfidence: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 flex space-x-3 items-start">
      <Info size={20} className="mt-0.5 text-blue-600" />
      <div>
        <h4 className="font-semibold mb-1">Understanding Confidence Scores</h4>
        <p className="text-sm">
          The confidence score indicates how certain the AI model is about its prediction. A higher score means the model detected stronger patterns consistent with manipulation or authenticity.
        </p>
        <p className="text-sm mt-2">
          <span className="font-semibold">Important:</span> These scores represent statistical likelihood based on learned patterns, not absolute proof. Always consider additional context and verification methods for critical decisions.
        </p>
      </div>
    </div>
  );
};

export default UnderstandingConfidence;