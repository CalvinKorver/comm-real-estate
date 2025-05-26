import React from "react"
import { BlockType, MetricType } from "@/types/workout"
import { BaseBlockProps, renderBaseBlock } from "./BaseBlock"

interface WorkBlockProps extends BaseBlockProps {
  pace?: string
  rest?: {
    time: number
    repeats?: number
  }
}

export default function WorkBlock({ 
  label, 
  distance, 
  unit, 
  time, 
  pace, 
  rest, 
  highlight,
  metricType
}: WorkBlockProps) {
  const additionalContent = (
    <>
      {/* Pace information */}
      {pace && (
        <div className="mt-2 text-zinc-400 text-base">Pace: {pace}</div>
      )}

      {/* Rest block information */}
      {rest && (
        <div className="mt-4 bg-black rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-zinc-300">Rest: </span>
              <span className="text-blue-400">{rest.time} seconds</span>
            </div>
            {rest.repeats && (
              <div className="text-zinc-400 text-sm">
                {rest.repeats} {rest.repeats === 1 ? 'repeat' : 'repeats'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return renderBaseBlock(
    {
      label,
      distance,
      unit,
      time,
      highlight,
      metricType
    },
    additionalContent
  );
} 