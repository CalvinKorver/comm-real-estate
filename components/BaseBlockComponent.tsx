import React, { useState } from "react"
import { BlockType, DistanceUnit, MetricType } from "@/types/workout"
import ActiveToggle from "@/components/ActiveToggle"

export interface BaseBlockProps {
  type: BlockType
  distance?: number
  duration?: number
  onDistanceChange: (distance: number) => void
  onDurationChange?: (duration: number) => void
  onRemove: () => void
  metricType?: MetricType
  onMetricTypeChange?: (metricType: MetricType) => void
}

export function getBlockColor(type: BlockType) {
  switch (type) {
    case BlockType.WARMUP:
      return 'bg-sky-800'
    case BlockType.WORK:
      return 'bg-sky-800'
    case BlockType.COOLDOWN:
      return 'bg-sky-800'
    default:
      return 'bg-zinc-800'
  }
}

export function renderMetricInput(
  type: BlockType,
  effectiveMetricType: MetricType,
  distance?: number,
  duration: number = 0,
  onDistanceChange?: (distance: number) => void,
  onDurationChange?: (duration: number) => void
) {
  return (
    <div className="flex items-end space-x-4">
      <div className="flex-1">
        <label htmlFor={`${type}-metric`} className="block text-sm text-white/70 mb-1">
          {effectiveMetricType === MetricType.DISTANCE ? "Distance" : "Duration"}
        </label>
        {effectiveMetricType === MetricType.DISTANCE ? (
          <input
            type="number"
            id={`${type}-distance`}
            value={distance ?? 0}
            onChange={(e) => onDistanceChange && onDistanceChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-black/20 rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
            min="0"
            step="0.1"
          />
        ) : (
          null
        )}
      </div>
      <div className="text-2xl text-white/70">
        {effectiveMetricType === MetricType.DISTANCE ? "miles" : ""}
      </div>
    </div>
  )
} 