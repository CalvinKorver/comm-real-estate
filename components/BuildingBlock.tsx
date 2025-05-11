import React from "react"
import { BlockType, DistanceUnit } from "@/types/workout"

interface BuildingBlockProps {
  type: BlockType
  distance: number
  onDistanceChange: (distance: number) => void
  onRemove: () => void
}

export default function BuildingBlock({ type, distance, onDistanceChange, onRemove }: BuildingBlockProps) {
  const getBlockColor = () => {
    switch (type) {
      case BlockType.WARMUP:
        return 'bg-blue-600'
      case BlockType.WORK:
        return 'bg-red-600'
      case BlockType.COOLDOWN:
        return 'bg-green-600'
      default:
        return 'bg-zinc-800'
    }
  }

  return (
    <div className={`rounded-xl ${getBlockColor()} p-6 mb-6 text-white`}>
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
      <div className="flex items-end space-x-4">
        <div className="flex-1">
          <label htmlFor="distance" className="block text-sm text-white/70 mb-1">
            Distance
          </label>
          <input
            type="number"
            id="distance"
            value={distance}
            onChange={(e) => onDistanceChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-black/20 rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
            min="0"
            step="0.1"
          />
        </div>
        <div className="text-2xl text-white/70">miles</div>
      </div>
    </div>
  )
} 