import React from "react"

interface BlockProps {
  label: string
  distance?: number
  unit?: string
  time?: number
  pace?: string
  rest?: string
  highlight?: boolean
}

export default function Block({ label, distance, unit, time, pace, rest, highlight }: BlockProps) {
  return (
    <div className={`rounded-xl bg-zinc-800 p-6 mb-6 ${highlight ? 'text-blue-500' : 'text-white'}`}>
      <div className="text-lg font-medium mb-2">{label}</div>
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
      {pace && (
        <div className="mt-2 text-zinc-400 text-base">Pace: {pace}</div>
      )}
      {rest && (
        <div className="mt-4 bg-black rounded-lg p-3">
          <span className="text-zinc-300">Rest: </span>
          <span className="text-blue-400">{rest}</span>
        </div>
      )}
    </div>
  )
} 