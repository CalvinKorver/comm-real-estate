import React, { useState } from "react"
import { BlockType, MetricType } from "@/types/workout"
import ActiveToggle from "@/components/ActiveToggle"
import { BaseBlockProps, getBlockColor, renderMetricInput } from "./BaseBlockComponent"

interface SharedBuildingBlockProps extends BaseBlockProps {
  additionalContent?: React.ReactNode
}

export default function SharedBuildingBlock({ 
  type, 
  distance, 
  duration = 0,
  onDistanceChange, 
  onDurationChange,
  onRemove,
  metricType = MetricType.DISTANCE,
  onMetricTypeChange,
  additionalContent
}: SharedBuildingBlockProps) {
  const [localMetricType, setLocalMetricType] = useState<MetricType>(metricType);
  const effectiveMetricType = onMetricTypeChange ? metricType : localMetricType;
  
  const handleToggle = () => {
    const newMetricType = effectiveMetricType === MetricType.DISTANCE ? MetricType.TIME : MetricType.DISTANCE;
    if (onMetricTypeChange) {
      onMetricTypeChange(newMetricType);
    } else {
      setLocalMetricType(newMetricType);
    }
  };

  return (
    <div className={`rounded-xl ${getBlockColor(type)} p-6 text-white`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </div>
        <button
          onClick={onRemove}
          className="text-white/70 hover:text-white transition-colors"
        >
          Remove
        </button>
      </div>
      
      {renderMetricInput(
        type,
        effectiveMetricType,
        distance,
        duration,
        onDistanceChange,
        onDurationChange
      )}
      
      {/* Duration toggle */}
      <div className="mt-2">
        <ActiveToggle
          isActive={effectiveMetricType === MetricType.TIME}
          isArchiving={false}
          onToggle={handleToggle}
          label="Duration"
        />
      </div>

      {/* Additional content for extending components */}
      {additionalContent}
    </div>
  )
}

// Export hook for shared state logic
export function useBuildingBlockState(
  metricType: MetricType = MetricType.DISTANCE,
  onMetricTypeChange?: (metricType: MetricType) => void
) {
  const [localMetricType, setLocalMetricType] = useState<MetricType>(metricType);
  const effectiveMetricType = onMetricTypeChange ? metricType : localMetricType;
  
  const handleToggle = () => {
    const newMetricType = effectiveMetricType === MetricType.DISTANCE ? MetricType.TIME : MetricType.DISTANCE;
    if (onMetricTypeChange) {
      onMetricTypeChange(newMetricType);
    } else {
      setLocalMetricType(newMetricType);
    }
  };

  return {
    effectiveMetricType,
    handleToggle
  };
} 