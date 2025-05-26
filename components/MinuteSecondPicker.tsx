import React, { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import 'react-time-picker/dist/TimePicker.css';

interface MinuteSecondPickerProps {
  value: number; // Duration in seconds
  onChange: (duration: number) => void;
  className?: string;
}

export default function MinuteSecondPicker({ value, onChange, className = '' }: MinuteSecondPickerProps) {
  // Convert seconds to HH:MM:SS format for TimePicker
  const formatTimeValue = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Parse HH:MM:SS format from TimePicker to seconds
  const parseTimeValue = (timeString: string | null): number => {
    if (!timeString) return 0;
    
    const [, minuteStr, secondStr] = timeString.split(':');
    const minutes = parseInt(minuteStr, 10) || 0;
    const seconds = parseInt(secondStr, 10) || 0;
    
    return minutes * 60 + seconds;
  };

  const [timeValue, setTimeValue] = useState<string>(formatTimeValue(value));

  // Update the time picker when the value prop changes
  useEffect(() => {
    setTimeValue(formatTimeValue(value));
  }, [value]);

  const handleChange = (newTime: string | null) => {
    if (newTime) {
      setTimeValue(newTime);
      const durationInSeconds = parseTimeValue(newTime);
      onChange(durationInSeconds);
    }
  };

  return (
    <div>
    <span className={className}>
      <TimePicker
        value={timeValue}
        onChange={handleChange}
        format="hh:mm:ss"
        disableClock={true}
        maxDetail="second"
        clearIcon={null}
        className="min-sec-picker"
      />
    </span>
    <span className="text-md pl-2">mins</span>
    </div>
  );
} 