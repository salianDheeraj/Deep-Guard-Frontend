// src/components/ConfidenceOverTimeChart.tsx
import React from 'react';

interface ChartProps {
  frameWiseConfidences: number[];
}

const ConfidenceOverTimeChart: React.FC<ChartProps> = ({ frameWiseConfidences }) => {
  const dataPoints = frameWiseConfidences.map((confidence) => ({
    type: confidence >= 0.5 ? 'FAKE' : 'REAL',
    height: confidence * 100,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Confidence Over Time</h3>
      
      <div className="flex items-end h-48 space-x-1" style={{height: '14rem'}}>
        {dataPoints.map((point, index) => (
          <div key={index} className="flex flex-col justify-end w-full h-full">
            {point.type === 'FAKE' ? (
              <div
                className="bg-[#D93F3F] rounded-t-sm"
                style={{ height: `${point.height}%` }}
              ></div>
            ) : (
              <div
                className="bg-[#22C55E]"
                style={{ height: `${point.height}%` }}
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
