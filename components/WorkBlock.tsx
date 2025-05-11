import React from "react"
import { BlockType, MetricType } from "@/types/workout"

interface WorkBlockProps {
  label: string
  distance?: number
  unit?: string
  time?: number
  pace?: string
  rest?: {
    time: number
    repeats?: number
  }
  highlight?: boolean
}

export default function WorkBlock({ label, distance, unit, time, pace, rest, highlight }: WorkBlockProps) {
  return (
    <div className={`rounded-xl bg-zinc-800 p-6 mb-6 ${highlight ? 'text-blue-500' : 'text-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-medium">{label}</div>
        {rest?.repeats && (
          <span className="text-zinc-400 text-sm">
            {rest.repeats} {rest.repeats === 1 ? 'repeat' : 'repeats'}
          </span>
        )}
      </div>
      
      {/* Main work block content */}
      <div className="flex items-end">
        {time !== undefined ? (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-white'}`}>
              {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
            </span>
            <span className="ml-2 text-2xl text-zinc-300">mins</span>
          </>
        ) : (
          <>
            <span className={`text-5xl font-bold ${highlight ? 'text-blue-500' : 'text-white'}`}>
              {distance?.toFixed(2)}
            </span>
            <span className="ml-2 text-2xl text-zinc-300">{unit}</span>
          </>
        )}
      </div>

      {/* Pace information */}
      {pace && (
        <div className="mt-2 text-zinc-400 text-base">Pace: {pace}</div>
      )}

      {/* Rest block information */}
      {rest && (
        <div className="mt-4 bg-black rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-zinc-300">Rest: </span>
            <span className="text-blue-400 ml-1">
              {Math.floor(rest.time / 60)}:{String(rest.time % 60).padStart(2, '0')} mins
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 