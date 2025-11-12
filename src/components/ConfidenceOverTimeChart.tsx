'use client';

import React, { useMemo, useRef } from 'react';
import { useChartAnimation } from '@/hooks/useChartAnimation ';
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
        totalFrames: 0,
        averageConfidence: 0,
        maxConfidence: 0,
        minConfidence: 0,
        stdDeviation: 0,
      };
    }

    const fakeCount = frameWiseConfidences.filter((c) => c > 0.5).length;
    const realCount = frameWiseConfidences.length - fakeCount;
    const avg =
      frameWiseConfidences.reduce((sum, c) => sum + c, 0) /
      frameWiseConfidences.length;
    const max = Math.max(...frameWiseConfidences);
    const min = Math.min(...frameWiseConfidences);
    const stdDev = Math.sqrt(
      frameWiseConfidences.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) /
        frameWiseConfidences.length
    );

    return {
      fakeFrames: fakeCount,
      realFrames: realCount,
      totalFrames: frameWiseConfidences.length,
      averageConfidence: avg,
      maxConfidence: max,
      minConfidence: min,
      stdDeviation: stdDev,
    };
  }, [frameWiseConfidences]);

  const chartBars = useMemo(() => {
    if (!frameWiseConfidences || frameWiseConfidences.length === 0) return [];

    const MAX_BARS = 200;
    if (frameWiseConfidences.length <= MAX_BARS) {
      return frameWiseConfidences.map((conf, idx) => ({
        value: conf,
        index: idx,
      }));
    }

    const step = Math.ceil(frameWiseConfidences.length / MAX_BARS);
    return frameWiseConfidences
      .map((conf, idx) => ({ value: conf, index: idx }))
      .filter((_, idx) => idx % step === 0)
      .slice(0, MAX_BARS);
  }, [frameWiseConfidences]);

  useChartAnimation(chartContainerRef, [chartBars.length]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 col-span-1 lg:col-span-3 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Confidence Over Time (Frame by Frame)
      </h3>

      {!frameWiseConfidences || frameWiseConfidences.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p>No confidence data available</p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <div className="flex gap-2">
              {/* Y-axis */}
              <div className="flex flex-col justify-between h-80 pr-2 text-xs text-gray-600 font-semibold">
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>

              {/* Bars + X-axis */}
              <div className="flex-1 relative">
                <div
                  ref={chartContainerRef}
                  className="flex items-end gap-[1px] h-80 bg-white rounded-t-md border border-gray-300 overflow-hidden"
                >
                  {chartBars.map((bar, idx) => {
                    const barHeight = Math.max(bar.value * 100, 3);
                    return (
                      <div
                        key={idx}
                        className={`flex-1 rounded-t-sm ${
                          bar.value >= 0.5
                            ? 'bg-gradient-to-t from-rose-500 to-rose-300 hover:from-rose-600 hover:to-rose-400'
                            : 'bg-gradient-to-t from-emerald-500 to-emerald-300 hover:from-emerald-600 hover:to-emerald-400'
                        } transition-transform duration-200 cursor-pointer`}
                        style={{
                          height: `${barHeight}%`,
                          minHeight: '3px',
                        }}
                        title={`Frame ${bar.index + 1}: ${Math.round(
                          bar.value * 100
                        )}% ${bar.value >= 0.5 ? 'FAKE' : 'REAL'}`}
                      />
                    );
                  })}
                </div>

                {/* X-axis line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-400" />

                {/* X-axis labels */}
                <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500 font-medium">
                  <span>0</span>
                  <span>{Math.floor(stats.totalFrames / 2)}</span>
                  <span>{stats.totalFrames}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-between items-center mt-10 text-sm text-gray-700 font-semibold">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded"></div>
                (Real)
              </span>
              <span>{stats.totalFrames} frames analyzed</span>
              <span className="flex items-center gap-2">
                (Fake)
                <div className="w-4 h-4 bg-gradient-to-t from-rose-500 to-rose-300 rounded"></div>
              </span>
            </div>
          </div>

          {/* Real vs Fake Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 shadow-sm">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                Fake Frames
              </p>
              <p className="text-4xl font-bold text-rose-600">
                {stats.fakeFrames}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {stats.totalFrames > 0
                  ? Math.round((stats.fakeFrames / stats.totalFrames) * 100)
                  : 0}
                % of total
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                Real Frames
              </p>
              <p className="text-4xl font-bold text-emerald-600">
                {stats.realFrames}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {stats.totalFrames > 0
                  ? Math.round((stats.realFrames / stats.totalFrames) * 100)
                  : 0}
                % of total
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Volatility
                </span>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {(stats.stdDeviation * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Confidence variance</p>
            </div>

            <div className="bg-violet-50 rounded-lg shadow-sm p-4 border border-violet-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Fake/Real Ratio
                </span>
                <BarChart3 className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-violet-700">
                {stats.fakeFrames}/{stats.realFrames}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Frame classification split
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg shadow-sm p-4 border border-emerald-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Lowest Confidence
                </span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">
                {(stats.minConfidence * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Most authentic frame</p>
            </div>

            <div className="bg-rose-50 rounded-lg shadow-sm p-4 border border-rose-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Peak Confidence
                </span>
                <TrendingUp className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-700">
                {(stats.maxConfidence * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Highest fake probability
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfidenceOverTimeChart;
