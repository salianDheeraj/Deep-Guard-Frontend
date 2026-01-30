'use client';

import React, { useMemo, useRef } from 'react';
import { useChartAnimation } from '@/hooks/useChartAnimation';
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

import styles from '@/styles/Analysis.module.css';

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
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>
        Confidence Over Time (Frame by Frame)
      </h3>

      {!frameWiseConfidences || frameWiseConfidences.length === 0 ? (
        <div className={styles.noData}>
          <p>No confidence data available</p>
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className={styles.chartArea}>
            <div className="flex gap-2">

              {/* Y-axis */}
              <div className={styles.chartYAxis}>
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>

              {/* Bars + X-axis */}
              <div className="flex-1 relative">
                <div
                  ref={chartContainerRef}
                  className={styles.barsContainer}
                >

                  {/* GRID LINES */}
                  <div className={styles.gridLines}>
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                      <div
                        key={v}
                        className={styles.gridLine}
                        style={{ bottom: `${v}%` }}
                      ></div>
                    ))}
                  </div>

                  {chartBars.map((bar, idx) => {
                    const fakePercent = bar.value * 100;
                    const realPercent = (1 - bar.value) * 100;

                    // real bars show real %, fake bars show fake %
                    const barHeight = Math.max(
                      bar.value >= 0.5 ? fakePercent : realPercent,
                      3
                    );

                    const displayPercent = bar.value >= 0.5 ? fakePercent : realPercent;

                    return (
                      <div
                        key={idx}
                        className={`${styles.chartBar} ${bar.value >= 0.5
                            ? styles.barFake
                            : styles.barReal
                          }`}
                        style={{
                          height: `${barHeight}%`,
                          minHeight: '3px',
                        }}
                        title={`Frame ${bar.index + 1}: ${Math.round(
                          displayPercent
                        )}% ${bar.value >= 0.5 ? 'FAKE' : 'REAL'}`}
                      />
                    );
                  })}
                </div>

                {/* X-axis line */}
                <div className={styles.xAxisLine} />

                {/* X-axis labels */}
                <div className={styles.xAxisLabels}>
                  <span>0</span>
                  <span>{Math.floor(stats.totalFrames / 2)}</span>
                  <span>{stats.totalFrames}</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <div className={styles.legendColorReal}></div>
                (Real)
              </span>
              <span>{stats.totalFrames} frames analyzed</span>
              <span className={styles.legendItem}>
                (Fake)
                <div className={styles.legendColorFake}></div>
              </span>
            </div>
          </div>

          {/* Real vs Fake Summary */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCardFake}>
              <p className={styles.summaryLabelFake}>
                Fake Frames
              </p>
              <p className={styles.summaryValueFake}>
                {stats.fakeFrames}
              </p>
              <p className={styles.summarySubtext}>
                {stats.totalFrames > 0
                  ? Math.round((stats.fakeFrames / stats.totalFrames) * 100)
                  : 0}
                % of total
              </p>
            </div>

            <div className={styles.summaryCardReal}>
              <p className={styles.summaryLabelReal}>
                Real Frames
              </p>
              <p className={styles.summaryValueReal}>
                {stats.realFrames}
              </p>
              <p className={styles.summarySubtext}>
                {stats.totalFrames > 0
                  ? Math.round((stats.realFrames / stats.totalFrames) * 100)
                  : 0}
                % of total
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className={styles.metricsGrid}>
            <div className={`${styles.metricCard} ${styles.metricCardBlue}`}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>
                  Volatility
                </span>
                <Activity className={styles.metricIconBlue} />
              </div>
              <p className={styles.metricValueBlue}>
                {(stats.stdDeviation * 100).toFixed(1)}%
              </p>
              <p className={styles.metricSubtext}>Confidence variance</p>
            </div>

            <div className={`${styles.metricCard} ${styles.metricCardViolet}`}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>
                  Fake/Real Ratio
                </span>
                <BarChart3 className={styles.metricIconViolet} />
              </div>
              <p className={styles.metricValueViolet}>
                {stats.fakeFrames}/{stats.realFrames}
              </p>
              <p className={styles.metricSubtext}>
                Frame classification split
              </p>
            </div>

            <div className={`${styles.metricCard} ${styles.metricCardEmerald}`}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>
                  Lowest Confidence
                </span>
                <TrendingDown className={styles.metricIconEmerald} />
              </div>
              <p className={styles.metricValueEmerald}>
                {(stats.minConfidence * 100).toFixed(1)}%
              </p>
              <p className={styles.metricSubtext}>Most authentic frame</p>
            </div>

            <div className={`${styles.metricCard} ${styles.metricCardRose}`}>
              <div className={styles.metricHeader}>
                <span className={styles.metricTitle}>
                  Peak Confidence
                </span>
                <TrendingUp className={styles.metricIconRose} />
              </div>
              <p className={styles.metricValueRose}>
                {(stats.maxConfidence * 100).toFixed(1)}%
              </p>
              <p className={styles.metricSubtext}>
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