'use client';

import React from 'react';
import { GlucoseUnit, GlucoseStatus } from '@/types';
import { convertGlucose, formatUnitLabel } from '@/utils/glucoseUtils';

interface GlucoseDialGaugeProps {
  value: number; // in mg/dL
  unit: GlucoseUnit;
  status: GlucoseStatus;
  trend: { symbol: string; text: string; degrees: number } | null;
  targetLow?: number;
  targetHigh?: number;
  timeLabel?: string;
  isStale?: boolean;
}

export default function GlucoseDialGauge({
  value,
  unit,
  status,
  trend,
  targetLow = 70,
  targetHigh = 180,
  timeLabel,
  isStale = false,
}: GlucoseDialGaugeProps) {
  // Dial geometry setup: 260 degree arc from 140° to 400°
  const cx = 140;
  const cy = 135;
  const radius = 108;
  const strokeWidth = 12;

  const startAngle = 140;
  const endAngle = 400;
  const totalSweep = endAngle - startAngle; // 260 degrees

  // Map mg/dL to [0, 1] clamped between 40 and 320 mg/dL
  const minVal = 40;
  const maxVal = 320;
  const clampedVal = Math.min(Math.max(value, minVal), maxVal);
  const normalizedVal = (clampedVal - minVal) / (maxVal - minVal);
  const activeSweep = normalizedVal * totalSweep;

  // Function to calculate (x, y) along the arc
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startAng: number, endAng: number) => {
    const start = polarToCartesian(x, y, r, endAng);
    const end = polarToCartesian(x, y, r, startAng);
    const largeArcFlag = endAng - startAng <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Status-driven styling
  const getStatusColorConfig = () => {
    switch (status) {
      case 'very-low':
      case 'low':
        return {
          stroke: '#f43f5e',
          glow: 'rgba(244, 63, 94, 0.25)',
          badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
          label: status === 'very-low' ? 'Urgent Low' : 'Below Target',
        };
      case 'high':
      case 'very-high':
        return {
          stroke: status === 'very-high' ? '#ea580c' : '#f59e0b',
          glow: status === 'very-high' ? 'rgba(234, 88, 12, 0.25)' : 'rgba(245, 158, 11, 0.25)',
          badgeBg: status === 'very-high'
            ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: status === 'very-high' ? 'bg-orange-500' : 'bg-amber-500',
          label: status === 'very-high' ? 'Elevated High' : 'Above Target',
        };
      case 'in-range':
      default:
        return {
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'In Target Range',
        };
    }
  };

  const statusConfig = getStatusColorConfig();

  // Coordinates for the current reading beacon dot
  const currentAngle = startAngle + activeSweep;
  const dotCoord = polarToCartesian(cx, cy, radius, currentAngle);

  // Target threshold tick angles
  const lowAngle = startAngle + ((targetLow - minVal) / (maxVal - minVal)) * totalSweep;
  const highAngle = startAngle + ((targetHigh - minVal) / (maxVal - minVal)) * totalSweep;

  const lowTickInner = polarToCartesian(cx, cy, radius - strokeWidth / 2 - 2, lowAngle);
  const lowTickOuter = polarToCartesian(cx, cy, radius + strokeWidth / 2 + 5, lowAngle);

  const highTickInner = polarToCartesian(cx, cy, radius - strokeWidth / 2 - 2, highAngle);
  const highTickOuter = polarToCartesian(cx, cy, radius + strokeWidth / 2 + 5, highAngle);

  const convertedValue = convertGlucose(value, unit);

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-4 select-none">
      {/* Ambient background glow behind the dial */}
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl opacity-30 dark:opacity-25 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: statusConfig.stroke }}
      />

      <div className="relative w-[280px] h-[250px] flex items-center justify-center">
        <svg
          viewBox="0 0 280 260"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Glowing filter for beacon dot */}
            <filter id="dialGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={statusConfig.stroke} floodOpacity="0.6" />
            </filter>

            {/* Target band linear gradient */}
            <linearGradient id="targetBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800/90 transition-colors"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Calibrated Target Band Sector (70 to 180 mg/dL) */}
          <path
            d={describeArc(cx, cy, radius, lowAngle, highAngle)}
            fill="none"
            stroke="url(#targetBandGrad)"
            strokeWidth={strokeWidth - 2}
            strokeLinecap="butt"
            className="opacity-70 dark:opacity-90"
          />

          {/* Threshold Tick Lines */}
          <line
            x1={lowTickInner.x}
            y1={lowTickInner.y}
            x2={lowTickOuter.x}
            y2={lowTickOuter.y}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1={highTickInner.x}
            y1={highTickInner.y}
            x2={highTickOuter.x}
            y2={highTickOuter.y}
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Active reading arc */}
          {activeSweep > 0 && (
            <path
              d={describeArc(cx, cy, radius, startAngle, currentAngle)}
              fill="none"
              stroke={statusConfig.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Calibrated numerical labels at bottom base of dial */}
          <text
            x={polarToCartesian(cx, cy, radius - 18, startAngle).x}
            y={polarToCartesian(cx, cy, radius - 18, startAngle).y + 5}
            textAnchor="middle"
            className="text-[10px] font-mono font-semibold fill-slate-400 dark:fill-slate-500"
          >
            40
          </text>
          <text
            x={polarToCartesian(cx, cy, radius - 18, endAngle).x}
            y={polarToCartesian(cx, cy, radius - 18, endAngle).y + 5}
            textAnchor="middle"
            className="text-[10px] font-mono font-semibold fill-slate-400 dark:fill-slate-500"
          >
            300+
          </text>

          {/* Beacon Dot at current reading */}
          <g className="transition-all duration-700 ease-out" filter="url(#dialGlow)">
            <circle
              cx={dotCoord.x}
              cy={dotCoord.y}
              r={strokeWidth / 2 + 1}
              fill="#ffffff"
              className="dark:fill-slate-900"
            />
            <circle
              cx={dotCoord.x}
              cy={dotCoord.y}
              r={strokeWidth / 2 - 1.5}
              fill={statusConfig.stroke}
            />
          </g>
        </svg>

        {/* Center Telemetry Readout */}
        <div className="absolute inset-0 top-3 flex flex-col items-center justify-center text-center">
          {/* Trend badge */}
          {trend && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="inline-flex items-center justify-center font-bold text-base px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                title={trend.text}
              >
                <span className="text-nest-600 dark:text-nest-400 mr-1">{trend.symbol}</span>
                <span className="text-[11px] font-medium tracking-tight">
                  {trend.text.split(' ')[0]}
                </span>
              </span>
            </div>
          )}

          {/* Numerical Value */}
          <div className="flex items-baseline justify-center tracking-tighter">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums leading-none">
              {convertedValue}
            </span>
            <span className="ml-1 text-xs sm:text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
              {formatUnitLabel(unit)}
            </span>
          </div>

          {/* Status pill badge */}
          <div className="mt-2 flex items-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badgeBg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
              <span>{statusConfig.label}</span>
            </span>
          </div>

          {/* Reading freshness / timestamp */}
          <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            {isStale ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Stale reading · {timeLabel}
              </span>
            ) : (
              <span>{timeLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Target range indicator bar underneath */}
      <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-emerald-500/80" />
          Target: {targetLow}–{targetHigh} {formatUnitLabel(unit)}
        </span>
      </div>
    </div>
  );
}
