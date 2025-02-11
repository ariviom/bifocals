import React, { useState, useEffect, useRef } from 'react';

interface IFrameDisplayProps {
  url: string;
  width: number;
  id: string;
  isSyncingScroll?: boolean;
}

// Note: For this to work with external domains, the target page needs to include the iframe-resizer content script:
// <script src="https://cdn.jsdelivr.net/npm/@iframe-resizer/client/iframeResizer.contentWindow.min.js"></script>

export const IFrameDisplay: React.FC<IFrameDisplayProps> = ({ 
  url, 
  width,
  id,
  isSyncingScroll = true
}) => {
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isSyncingScroll || isScrollingRef.current) return;

      if (event.data.type === 'scroll' && event.data.frameId !== id) {
        isScrollingRef.current = true;

        // Forward the scroll message to the iframe
        iframeRef.current?.contentWindow?.postMessage(event.data, '*');

        // Reset scrolling state after a short delay
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 50);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id, isSyncingScroll]);

  const handleError = () => {
    setError(
      'This website cannot be embedded due to security restrictions.\nTry example.com or websafe.dev instead.'
    );
  };

  if (!url) {
    return (
      <div className="frame-message">
        <p>Enter a URL above to get started</p>
        <p className="hint">Note: Some sites may not allow embedding</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="frame-message">
        <p className="error">{error}</p>
      </div>
    );
  }

  // Create the proxy URL
  const proxyUrl = url ? `/api/proxy?url=${encodeURIComponent(url.trim())}` : '';

  return (
    <div className="iframe-wrapper">
      <div className="iframe-container" style={{ width: `${width}px` }}>
        {proxyUrl && (
          <iframe
            ref={iframeRef}
            id={id}
            src={proxyUrl}
            onError={handleError}
            scrolling="yes"
          />
        )}
      </div>
    </div>
  );
}; 