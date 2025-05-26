import React, { useState } from "react"
import { DistanceUnit } from "@/types/workout"
import ActiveToggle from "@/components/ActiveToggle"
import MinuteSecondPicker from "@/components/MinuteSecondPicker"
import { BaseBlockProps } from "./BaseBlockComponent"
import SharedBuildingBlock from "./SharedBuildingBlock"

interface WorkBuildingBlockProps extends BaseBlockProps {
  paceConstraint?: {
    duration: number;
    unit: DistanceUnit;
  };
  onPaceConstraintChange?: (paceConstraint: { duration: number; unit: DistanceUnit } | undefined) => void;
}

export default function WorkBuildingBlock({ 
  paceConstraint,
  onPaceConstraintChange,
  ...baseProps
}: WorkBuildingBlockProps) {
  const [isPaced, setIsPaced] = useState<boolean>(!!paceConstraint);
  const [paceDuration, setPaceDuration] = useState<number>(paceConstraint?.duration || 480); // Default 8 minutes

  const handlePacingToggle = () => {
    const newIsPaced = !isPaced;
    setIsPaced(newIsPaced);
    
    if (onPaceConstraintChange) {
      if (newIsPaced) {
        onPaceConstraintChange({
          duration: paceDuration,
          unit: DistanceUnit.MILES
        });
      } else {
        onPaceConstraintChange(undefined);
      }
    }
  };

  const handlePaceDurationChange = (newDuration: number) => {
    setPaceDuration(newDuration);
    
    if (isPaced && onPaceConstraintChange) {
      onPaceConstraintChange({
        duration: newDuration,
        unit: DistanceUnit.MILES
      });
    }
  };

  const pacingContent = (
    <>
      {/* Pace toggle */}
      <div className="mt-2">
        <ActiveToggle
          isActive={isPaced}
          isArchiving={false}
          onToggle={handlePacingToggle}
          label="Paced"
        />
      </div>

      {/* Pacing settings (only shown when pacing is enabled) */}
      {isPaced && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
          <div className="text-sm text-white/70 mb-2">Target Pace (min/mile)</div>
          <div className="flex items-center">
            <MinuteSecondPicker
              value={paceDuration}
              onChange={handlePaceDurationChange}
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <SharedBuildingBlock 
      {...baseProps}
      additionalContent={pacingContent}
    />
  );
} 