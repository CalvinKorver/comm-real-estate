import React from "react"
import { BlockType, MetricType } from "@/types/workout"

export interface BaseBlockProps {
  label: string
  distance?: number
  unit?: string
  time?: number
  highlight?: boolean
  metricType?: MetricType
}

export function formatTime(seconds?: number): string {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function renderBaseBlock(
  props: BaseBlockProps,
  additionalContent?: React.ReactNode
) {
  const { label, distance, unit, time, highlight, metricType } = props;
  
  return (
    <div className={`rounded-xl bg-gray-800 p-6 mb-6 ${highlight ? 'text-blue-500' : 'text-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-medium">{label}</div>
      </div>
      
      {/* Main work block content */}
      <div className="flex items-end">
        {(metricType === MetricType.TIME && time) ? (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-white'}`}>
              {formatTime(time)}
            </span>
            <span className="ml-2 text-2xl text-zinc-300">mins</span>
          </>
        ) : (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-white'}`}>
              {distance ? distance.toFixed(2) : "0.00"}
            </span>
            <span className="ml-2 text-2xl text-zinc-300">{unit || "mi"}</span>
          </>
        )}
      </div>

      {additionalContent}
    </div>
  );
} 