// src/components/ConfidenceOverTimeChart.tsx
import React from 'react';

const ConfidenceOverTimeChart: React.FC = () => {
  // 1. Data now has a 'type' (FAKE or REAL) and a 'height'
  // This 20-bar pattern matches your image exactly.
  const dataPoints = [
    { type: 'FAKE', height: 85 },
    { type: 'FAKE', height: 82 },
    { type: 'FAKE', height: 80 },
    { type: 'REAL', height: 70 }, // Green bar
    { type: 'FAKE', height: 83 },
    { type: 'FAKE', height: 80 },
    { type: 'FAKE', height: 88 },
    { type: 'REAL', height: 73 }, // Green bar
    { type: 'FAKE', height: 80 },
    { type: 'FAKE', height: 78 },
    { type: 'FAKE', height: 83 },
    { type: 'FAKE', height: 85 },
    { type: 'FAKE', height: 81 },
    { type: 'REAL', height: 65 }, // Green bar
    { type: 'FAKE', height: 83 },
    { type: 'FAKE', height: 85 },
    { type: 'FAKE', height: 80 },
    { type: 'FAKE', height: 86 },
    { type: 'REAL', height: 72 }, // Green bar
    { type: 'FAKE', height: 83 },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Confidence Over Time</h3>
      
      {/* 2. Added 'space-x-1' for the small gap between bars */}
      <div className="flex items-end h-48 space-x-1" style={{height: '14rem'}}>
        {dataPoints.map((point, index) => (
          <div key={index} className="flex flex-col justify-end w-full h-full">
            {/* 3. This is the fix: It renders ONE bar, either red or green */}
            {point.type === 'FAKE' ? (
              <div
                className="bg-[#D93F3F] rounded-t-sm" // Red bar, rounded top
                style={{ height: `${point.height}%` }}
              ></div>
            ) : (
              <div
                className="bg-[#22C55E]" // Green bar, NO rounding
                style={{ height: `${point.height}%` }}
              ></div>
            )}
          </div>
        ))}
      </div>
      
      {/* 4. Legend is correct (squares and light text) */}
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