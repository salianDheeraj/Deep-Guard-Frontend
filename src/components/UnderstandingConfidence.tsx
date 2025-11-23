// src/components/UnderstandingConfidence.tsx
import React from 'react';
import { Info } from 'lucide-react';

const UnderstandingConfidence: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-900 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 rounded-lg p-4 flex space-x-3 items-start transition-colors duration-300">
      <Info size={20} className="mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div>
        <h4 className="font-semibold mb-1 text-blue-900 dark:text-white">Understanding Confidence Scores</h4>
        <p className="text-sm dark:text-gray-300">
          The confidence score indicates how certain the AI model is about its prediction. A higher score means the model detected stronger patterns consistent with manipulation or authenticity.
        </p>
        <p className="text-sm mt-2 dark:text-gray-300">
          <span className="font-semibold text-blue-900 dark:text-blue-200">Important:</span> These scores represent statistical likelihood based on learned patterns, not absolute proof. Always consider additional context and verification methods for critical decisions.
        </p>
      </div>
    </div>
  );
};

export default UnderstandingConfidence;