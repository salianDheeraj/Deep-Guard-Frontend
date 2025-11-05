// src/components/ConfidenceOverTimeChart.tsx
'use client';

import React from 'react';

interface ChartProps {
  frameWiseConfidences: number[];
}

const ConfidenceOverTimeChart: React.FC<ChartProps> = ({ frameWiseConfidences }) => {
  // Convert frame confidences to FAKE/REAL based on threshold
  const dataPoints = frameWiseConfidences.map((confidence) => ({
    type: confidence >= 0.5 ? 'FAKE' : 'REAL',
    height: confidence * 100, // Convert to percentage
  }));

  // Count FAKE vs REAL
  const fakeCount = dataPoints.filter(p => p.type === 'FAKE').length;
  const realCount = dataPoints.filter(p => p.type === 'REAL').length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Confidence Over Time</h3>

      {/* Bar Chart */}
      <div className="flex items-end h-48 space-x-1 bg-gray-50 p-4 rounded-lg mb-6">
        {dataPoints.map((point, index) => (
          <div key={index} className="flex flex-col justify-end w-full h-full">
            {point.type === 'FAKE' ? (
              <div
                className="bg-red-600 rounded-t-sm hover:opacity-80 transition cursor-pointer"
                style={{ height: `${point.height}%`, minHeight: '2px' }}
                title={`Frame ${index + 1}: ${point.height.toFixed(1)}%`}
              ></div>
            ) : (
              <div
                className="bg-green-500 rounded-t-sm hover:opacity-80 transition cursor-pointer"
                style={{ height: `${point.height}%`, minHeight: '2px' }}
                title={`Frame ${index + 1}: ${point.height.toFixed(1)}%`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">FAKE Frames</p>
          <p className="text-2xl font-bold text-red-600">{fakeCount}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">REAL Frames</p>
          <p className="text-2xl font-bold text-green-600">{realCount}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center text-xs mt-4 space-x-6">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-600 rounded-sm mr-2"></span>
          <span className="text-gray-700">FAKE Detection (&ge; 50%)</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-sm mr-2"></span>
          <span className="text-gray-700">REAL Detection (&lt; 50%)</span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceOverTimeChart;