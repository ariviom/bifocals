import React, { useState, useRef, useEffect } from 'react';
import { URLInput } from './URLInput';
import { ViewportController } from './ViewportController';
import { DiscoMode } from './DiscoMode';
import { IFrameDisplay } from './IFrameDisplay';

export const ComparisonContainer: React.FC = () => {
  const [leftUrl, setLeftUrl] = useState('');
  const [rightUrl, setRightUrl] = useState('');
  const [width, setWidth] = useState(375);
  const [isSyncingScroll, setIsSyncingScroll] = useState(true);
  const [isDiscoActive, setIsDiscoActive] = useState(false);

  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef(false);

  // Handle horizontal scroll sync
  useEffect(() => {
    if (!isSyncingScroll) return;

    const handleScroll = (e: Event) => {
      if (isScrollingSyncRef.current) return;

      const sourceContainer = e.target as HTMLDivElement;
      const targetContainer = sourceContainer === leftContainerRef.current
        ? rightContainerRef.current
        : leftContainerRef.current;

      if (targetContainer && sourceContainer.scrollLeft !== targetContainer.scrollLeft) {
        isScrollingSyncRef.current = true;
        targetContainer.scrollLeft = sourceContainer.scrollLeft;

        // Reset the scrolling flag after a short delay
        setTimeout(() => {
          isScrollingSyncRef.current = false;
        }, 50);
      }
    };

    const leftContainer = leftContainerRef.current;
    const rightContainer = rightContainerRef.current;

    if (leftContainer && rightContainer) {
      leftContainer.addEventListener('scroll', handleScroll, { passive: true });
      rightContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (leftContainer && rightContainer) {
        leftContainer.removeEventListener('scroll', handleScroll);
        rightContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isSyncingScroll]);

  return (
    <>
      <div className="toolbar">
        <div className="branding">
          👓 bifocals
        </div>

        <div className="url-inputs">
          <div className="url-input">
            <URLInput
              onURLChange={setLeftUrl}
              placeholder="Left URL..."
            />
          </div>
          <div className="url-input">
            <URLInput
              onURLChange={setRightUrl}
              placeholder="Right URL..."
            />
          </div>
        </div>

        <div className="viewport-controls">
          <ViewportController
            onWidthChange={setWidth}
            disabled={isDiscoActive}
          />
        </div>

        <DiscoMode
          onWidthChange={setWidth}
          onActiveChange={setIsDiscoActive}
          disabled={false}
        />

        <div className="sync-scroll">
          <input
            type="checkbox"
            id="syncScroll"
            checked={isSyncingScroll}
            onChange={(e) => setIsSyncingScroll(e.target.checked)}
          />
          <label htmlFor="syncScroll">Sync scroll</label>
        </div>
      </div>

      <div className="display-area">
        <div className="frame-container" ref={leftContainerRef}>
          <IFrameDisplay
            id="left-frame"
            url={leftUrl}
            width={width}
            isSyncingScroll={isSyncingScroll}
          />
        </div>
        <div className="frame-container" ref={rightContainerRef}>
          <IFrameDisplay
            id="right-frame"
            url={rightUrl}
            width={width}
            isSyncingScroll={isSyncingScroll}
          />
        </div>
      </div>
    </>
  );
}; 