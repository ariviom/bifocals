import type { APIRoute } from 'astro';

const SYNC_SCRIPT = `
<script>
  window.addEventListener('load', () => {
    const frameId = window.frameElement?.id;
    let isScrolling = false;
    let lastScrollX = window.scrollX;
    let lastScrollY = window.scrollY;
    let scrollTimeout;
    
    // Improved throttle function with leading edge execution
    function throttle(func, limit) {
      let inThrottle;
      return function(...args) {
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        } else {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => func.apply(context, args), limit);
        }
      }
    }

    // Send scroll position to parent
    const sendScroll = throttle(() => {
      if (!isScrolling) {
        const currentX = window.scrollX;
        const currentY = window.scrollY;
        const containerX = window.frameElement?.parentElement?.parentElement?.scrollLeft || 0;
        
        // Only send if position has changed
        if (currentX !== lastScrollX || currentY !== lastScrollY) {
          lastScrollX = currentX;
          lastScrollY = currentY;
          
          window.parent.postMessage({
            type: 'scroll',
            frameId,
            x: currentX,
            y: currentY,
            containerX,
            height: document.documentElement.scrollHeight,
            width: document.documentElement.scrollWidth,
            viewportHeight: window.innerHeight,
            viewportWidth: window.innerWidth
          }, '*');
        }
      }
    }, 16); // ~60fps

    // Listen for scroll events with passive option for better performance
    window.addEventListener('scroll', sendScroll, { passive: true });

    // Listen for container scroll events
    window.frameElement?.parentElement?.parentElement?.addEventListener('scroll', () => {
      const containerX = window.frameElement?.parentElement?.parentElement?.scrollLeft || 0;
      window.parent.postMessage({
        type: 'containerScroll',
        frameId,
        containerX
      }, '*');
    }, { passive: true });

    // Listen for scroll messages from parent
    window.addEventListener('message', (event) => {
      if (event.data.type === 'scroll' && event.data.frameId !== frameId) {
        isScrolling = true;
        
        // Calculate the scroll position based on relative dimensions
        const heightRatio = (document.documentElement.scrollHeight - window.innerHeight) /
                          (event.data.height - event.data.viewportHeight);
        const widthRatio = (document.documentElement.scrollWidth - window.innerWidth) /
                          (event.data.width - event.data.viewportWidth);
        
        const targetX = event.data.x * widthRatio;
        const targetY = event.data.y * heightRatio;

        // Only scroll if position has changed
        if (targetX !== window.scrollX || targetY !== window.scrollY) {
          window.scrollTo({
            left: targetX,
            top: targetY,
            behavior: 'auto'
          });
        }

        // Sync container scroll
        const container = window.frameElement?.parentElement?.parentElement;
        if (container && container.scrollLeft !== event.data.containerX) {
          container.scrollLeft = event.data.containerX;
        }

        setTimeout(() => {
          isScrolling = false;
        }, 50);
      } else if (event.data.type === 'containerScroll' && event.data.frameId !== frameId) {
        const container = window.frameElement?.parentElement?.parentElement;
        if (container && container.scrollLeft !== event.data.containerX) {
          container.scrollLeft = event.data.containerX;
        }
      }
    });

    // Send initial scroll position and handle resize
    setTimeout(sendScroll, 100);
    window.addEventListener('resize', sendScroll, { passive: true });
  });
</script>
`;

interface ProxyError extends Error {
  code?: string;
}

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('URL parameter is required', { status: 400 });
    }

    // Ensure the URL has a protocol
    const fullUrl = targetUrl.match(/^https?:\/\//) ? targetUrl : `https://${targetUrl}`;
    const targetUrlObj = new URL(fullUrl);

    console.log('Proxying request to:', fullUrl);

    // Set up fetch options with timeouts and additional headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'Bifocals Proxy',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      const isHTML = contentType?.includes('text/html');

      // For non-HTML content (assets), proxy as-is
      if (!isHTML) {
        return new Response(response.body, {
          headers: {
            'content-type': contentType || 'application/octet-stream',
            'cache-control': 'public, max-age=31536000',
          }
        });
      }

      let html = await response.text();

      // Rewrite relative URLs to absolute URLs
      html = html.replace(
        /((?:src|href)=["'])\/(?!\/)/g, 
        `$1${targetUrlObj.origin}/`
      );

      // Rewrite absolute URLs that point to the target domain
      html = html.replace(
        new RegExp(`((?:src|href)=["'])${targetUrlObj.origin}\/`, 'g'),
        `$1/api/proxy?url=${encodeURIComponent(targetUrlObj.origin)}/`
      );

      // Handle script tags with dynamic imports
      html = html.replace(
        /import\s*\(\s*['"`]\//g,
        `import("/api/proxy?url=${encodeURIComponent(targetUrlObj.origin)}/`
      );

      // Inject our scroll sync script before the closing body tag
      html = html.replace('</body>', `${SYNC_SCRIPT}</body>`);

      return new Response(html, {
        headers: {
          'content-type': 'text/html',
          'x-frame-options': 'SAMEORIGIN'
        }
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response('Request timed out - the website took too long to respond', { status: 504 });
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    
    // Provide more user-friendly error messages
    let errorMessage = 'Failed to proxy request: ';
    const proxyError = error as ProxyError;
    
    if (proxyError.code === 'UND_ERR_CONNECT_TIMEOUT') {
      errorMessage += 'Connection timed out. The website may be down or blocking requests.';
    } else if (proxyError.code === 'ERR_INVALID_URL') {
      errorMessage += 'Invalid URL provided. Please check the URL format.';
    } else if (proxyError instanceof Error && proxyError.message.includes('ENOTFOUND')) {
      errorMessage += 'Could not resolve the website address. Please check if the URL is correct.';
    } else if (proxyError instanceof Error) {
      errorMessage += proxyError.message;
    } else {
      errorMessage += 'An unknown error occurred';
    }

    return new Response(errorMessage, { 
      status: proxyError.code === 'ERR_INVALID_URL' ? 400 : 502,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}; 