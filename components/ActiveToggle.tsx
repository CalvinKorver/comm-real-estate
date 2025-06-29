import React from 'react';

interface ActiveToggleProps {
  isActive: boolean
  isArchiving: boolean
  onToggle: () => void
  label?: string
}

export default function ActiveToggle({ isActive, isArchiving, onToggle, label }: ActiveToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground">
        {label || 'Active'}
      </span>
      <button
        onClick={onToggle}
        disabled={isArchiving}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isActive ? '#ef4444' : '#9ca3af'
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
} 