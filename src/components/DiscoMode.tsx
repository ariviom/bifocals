import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DiscoModeProps {
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  intervalSec?: number;
  onActiveChange: (isActive: boolean) => void;
  disabled?: boolean;
}

export const DiscoMode: React.FC<DiscoModeProps> = ({
  onWidthChange,
  minWidth = 375,
  maxWidth = 1440,
  intervalSec = 3,
  onActiveChange,
  disabled = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(intervalSec);
  const [countdown, setCountdown] = useState(intervalSec);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTransitionTimeRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const currentWidthRef = useRef(minWidth);
  const targetWidthRef = useRef(minWidth);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      lastTransitionTimeRef.current = timestamp;
    }

    const timeSinceLastTransition = timestamp - (lastTransitionTimeRef.current || 0);
    const progress = Math.min(1, timeSinceLastTransition / 1000);
    
    // Update countdown
    if (isActive) {
      const timeLeft = Math.max(0, currentInterval - (timeSinceLastTransition / 1000));
      setCountdown(Math.ceil(timeLeft));
    }

    // Only start the next transition after the delay
    if (timeSinceLastTransition >= currentInterval * 1000) {
      lastTransitionTimeRef.current = timestamp;
      
      // Flip direction when we reach an endpoint
      if (currentWidthRef.current >= maxWidth) {
        directionRef.current = -1;
      } else if (currentWidthRef.current <= minWidth) {
        directionRef.current = 1;
      }

      // Calculate the target width for this transition
      const range = maxWidth - minWidth;
      const step = range / 4; // Divide range into quarters for smoother transitions
      targetWidthRef.current = Math.max(
        minWidth,
        Math.min(
          maxWidth,
          currentWidthRef.current + (step * directionRef.current)
        )
      );
    }

    // Smoothly animate to target width
    if (currentWidthRef.current !== targetWidthRef.current) {
      const diff = targetWidthRef.current - currentWidthRef.current;
      const step = diff * Math.min(0.1, progress); // Smooth easing
      currentWidthRef.current += step;
      
      // Snap to target if we're very close
      if (Math.abs(targetWidthRef.current - currentWidthRef.current) < 1) {
        currentWidthRef.current = targetWidthRef.current;
      }
      
      onWidthChange(Math.round(currentWidthRef.current));
    }

    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [isActive, currentInterval, minWidth, maxWidth, onWidthChange]);

  useEffect(() => {
    if (isActive && !disabled) {
      startTimeRef.current = null;
      lastTransitionTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(animate);
      setCountdown(currentInterval);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setIsActive(false);
      setCountdown(currentInterval);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, animate, disabled, currentInterval]);

  useEffect(() => {
    onActiveChange(isActive);
  }, [isActive, onActiveChange]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInterval = Math.max(0.1, parseFloat(e.target.value));
    setCurrentInterval(newInterval);
    setCountdown(newInterval);
    lastTransitionTimeRef.current = null; // Reset timing when interval changes
  };

  return (
    <div className="disco-controls">
      <button
        onClick={() => setIsActive(!isActive)}
        className={isActive ? 'active' : ''}
        disabled={disabled}
      >
        {isActive ? `Stop Disco (${countdown}s)` : 'Start Disco'}
      </button>
      <input
        type="number"
        value={currentInterval}
        onChange={handleIntervalChange}
        min="0.1"
        step="0.1"
        disabled={isActive || disabled}
      />
      <span>s</span>
    </div>
  );
}; 