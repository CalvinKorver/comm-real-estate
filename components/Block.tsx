import React from "react"
import { MetricType } from "@/types/workout"
import { BaseBlockProps, renderBaseBlock } from "./BaseBlock"

interface BlockProps extends BaseBlockProps {
  pace?: string
  rest?: string
}

export default function Block({ 
  label, 
  distance, 
  unit, 
  time, 
  pace,
  rest,
  highlight,
  metricType
}: BlockProps) {
  const additionalContent = (
    <>
      {pace && (
        <div className="mt-2 text-zinc-400 text-base">Pace: {pace}</div>
      )}
      {rest && (
        <div className="mt-4 bg-black rounded-lg p-3">
          <span className="text-zinc-300">Rest: </span>
          <span className="text-blue-400">{rest}</span>
        </div>
      )}
    </>
  );

  return renderBaseBlock({
    label,
    distance,
    unit,
    time,
    highlight,
    metricType
  }, additionalContent);
} 