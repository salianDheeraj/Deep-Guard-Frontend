'use client';

import React, { useMemo, useRef } from 'react';
import { useChartAnimation } from '@/hooks/useChartAnimation ';

interface ConfidenceOverTimeChartProps {
  frameWiseConfidences: number[];
}

const ConfidenceOverTimeChart: React.FC<ConfidenceOverTimeChartProps> = ({
  frameWiseConfidences = []
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const stats = useMemo(() => {
    if (!frameWiseConfidences || frameWiseConfidences.length === 0) {
      return {
        fakeFrames: 0,
        realFrames: 0,
        totalFrames: 0
      };
    }

    const fakeCount = frameWiseConfidences.filter(c => c >= 0.5).length;
    const realCount = frameWiseConfidences.length - fakeCount;

    return {
      fakeFrames: fakeCount,
      realFrames: realCount,
      totalFrames: frameWiseConfidences.length
    };
  }, [frameWiseConfidences]);

  const chartBars = useMemo(() => {
    if (!frameWiseConfidences || frameWiseConfidences.length === 0) return [];
    
    const MAX_BARS = 200;
    
    if (frameWiseConfidences.length <= MAX_BARS) {
      return frameWiseConfidences.map((conf, idx) => ({ value: conf, index: idx }));
    }
    
    const step = Math.ceil(frameWiseConfidences.length / MAX_BARS);
    return frameWiseConfidences
      .map((conf, idx) => ({ value: conf, index: idx }))
      .filter((_, idx) => idx % step === 0)
      .slice(0, MAX_BARS);
  }, [frameWiseConfidences]);

  useChartAnimation(chartContainerRef, [chartBars.length]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 col-span-1 lg:col-span-3">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Confidence Over Time (Frame by Frame)</h3>

      {!frameWiseConfidences || frameWiseConfidences.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p>No confidence data available</p>
        </div>
      ) : (
        <>
          {/* Large Timeline Chart with Axes */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            {/* Chart with Y-axis */}
        <div className="flex gap-2">
  {/* Y-axis: only 10-100% ticks */}
  <div className="flex flex-col justify-between h-80 py-4 pr-2 text-xs text-gray-600 font-semibold">
    <span>100</span>
    <span>90</span>
    <span>80</span>
    <span>70</span>
    <span>60</span>
    <span>50</span>
    <span>40</span>
    <span>30</span>
    <span>20</span>
    <span>10</span>
  </div>

  {/* Chart bars */}
  <div className="flex-1">
    <div 
      ref={chartContainerRef} 
      className="flex items-end gap-[1px] h-80 bg-white p-4 rounded border-2 border-gray-300 overflow-hidden"
    >
      {chartBars.length > 0 ? (
        chartBars.map((bar, idx) => {
          let barHeight = Math.max(bar.value * 100, 3);

          return (
            <div
              key={idx}
              className={`chart-bar flex-1 rounded-t ${
                bar.value >= 0.5
                  ? 'bg-gradient-to-t from-red-500 to-red-300 hover:from-red-600 hover:to-red-400'
                  : 'bg-gradient-to-t from-green-500 to-green-300 hover:from-green-600 hover:to-green-400'
              } transition-colors cursor-pointer`}
              style={{ 
                height: `${barHeight}%`, 
                minHeight: '3px',
                maxWidth: '100%'
              }}
              title={`Frame ${bar.index + 1}: ${Math.round(bar.value * 100)}% ${bar.value >= 0.5 ? 'FAKE' : 'REAL'}`}
            />
          );
        })
      ) : (
        <div className="text-gray-400 text-center w-full">No data</div>
      )}
    </div>
  </div>
</div>



            {/* Legend */}
            <div className="flex justify-between items-center mt-8 text-sm text-gray-700 font-semibold">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-300 rounded"></div>
                (Real)
              </span>
              <span>{stats.totalFrames} frames analyzed</span>
              <span className="flex items-center gap-2">
                (Fake)
                <div className="w-4 h-4 bg-gradient-to-t from-red-500 to-red-300 rounded"></div>
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Fake Frames</p>
              <p className="text-4xl font-bold text-red-600">{stats.fakeFrames}</p>
              <p className="text-sm text-gray-600 mt-2">{stats.totalFrames > 0 ? Math.round((stats.fakeFrames / stats.totalFrames) * 100) : 0}% of total</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Real Frames</p>
              <p className="text-4xl font-bold text-green-600">{stats.realFrames}</p>
              <p className="text-sm text-gray-600 mt-2">{stats.totalFrames > 0 ? Math.round((stats.realFrames / stats.totalFrames) * 100) : 0}% of total</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfidenceOverTimeChart;
