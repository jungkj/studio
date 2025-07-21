import { useEffect, useState } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

export const useWindowResize = (containerRef?: React.RefObject<HTMLElement>) => {
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = containerRef?.current || document.querySelector('[data-window-content]');
    if (!element) return;

    // Initial dimensions
    setDimensions({
      width: element.clientWidth,
      height: element.clientHeight,
    });

    // Listen for custom window resize events dispatched by Window component
    const handleResize = (event: Event) => {
      const customEvent = event as CustomEvent<WindowDimensions>;
      setDimensions(customEvent.detail);
    };

    // Also observe direct size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    element.addEventListener('windowResize', handleResize);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('windowResize', handleResize);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return dimensions;
};