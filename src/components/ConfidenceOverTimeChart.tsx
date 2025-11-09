// src/components/ConfidenceOverTimeChart.tsx
"use client";

import React, { useRef } from 'react'; // 1. Only import 'useRef'
import { useChartAnimation } from '@/hooks/useChartAnimation';

// 2. DEFINE THE CORRECT TYPES (array of objects)
interface ChartData {
  name: string;
  FAKE: number;
  REAL: number;
}

interface ChartProps {
  frameWiseConfidences: ChartData[]; // This accepts the correct data type
}

const ConfidenceOverTimeChart: React.FC<ChartProps> = ({ frameWiseConfidences }) => {
  const container = useRef(null); // The scope ref
  
  // Use the prop directly. If it's empty, provide a fallback.
  const dataToDisplay = frameWiseConfidences.length > 0 ? frameWiseConfidences : [
    { name: 'F1', FAKE: 85, REAL: 0 },
    { name: 'F2', FAKE: 82, REAL: 0 },
    { name: 'F3', FAKE: 80, REAL: 0 },
    { name: 'F4', FAKE: 0, REAL: 70 },
  ];

  // Call your animation hook
  useChartAnimation(container, [dataToDisplay]); 

  return (
    // Add the ref to the main div
    <div className="bg-white rounded-lg shadow p-6 h-full" ref={container}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Confidence Over Time</h3>
      
      <div className="flex items-end h-48 space-x-1" style={{height: '14rem'}}>
        {dataToDisplay.map((point, index) => (
          <div key={index} className="flex flex-col justify-end w-full h-full">
            {/* Add the "chart-bar-segment" class to the bars */}
            {point.FAKE > 0 ? (
              <div
                className="chart-bar-segment bg-[#D93F3F] rounded-t-sm"
                style={{ height: `${point.FAKE}%` }}
              ></div>
            ) : (
              <div
                className="chart-bar-segment bg-[#22C55E]"
                style={{ height: `${point.REAL}%` }}
              ></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center text-xs mt-4 space-x-4">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-[#D93F3F] rounded-sm mr-1.5"></span> 
          <span className="text-gray-500">FAKE Detection</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-[#22C55E] rounded-sm mr-1.5"></span>
          <span className="text-gray-500">REAL Detection</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceOverTimeChart;