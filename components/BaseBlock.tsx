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

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }
  return mins.toString();
}

export function renderBaseBlock(
  props: BaseBlockProps,
  additionalContent?: React.ReactNode
) {
  const { label, distance, unit, time, highlight, metricType } = props;
  
  return (
    <div className={`rounded-xl bg-card p-6 mb-6 ${highlight ? 'text-blue-500' : 'text-card-foreground'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-medium">{label}</div>
      </div>
      
      {/* Main work block content */}
      <div className="flex items-end">
        {(metricType === MetricType.TIME && time) ? (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-card-foreground'}`}>
              {formatTime(time)}
            </span>
            <span className="ml-2 text-2xl text-muted-foreground">mins</span>
          </>
        ) : (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-card-foreground'}`}>
              {distance ? distance.toFixed(2) : "0.00"}
            </span>
            <span className="ml-2 text-2xl text-muted-foreground">{unit || "mi"}</span>
          </>
        )}
      </div>

      {additionalContent}
    </div>
  );
} 