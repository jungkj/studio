import { useEffect, useRef } from 'react';
import cursorManager from '../utils/cursorManager';

interface UseCursorOptions {
  cursor: string;
  hotspotX?: number;
  hotspotY?: number;
  resetOnLeave?: boolean;
  disabled?: boolean;
}

export function useCursor(options: UseCursorOptions) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || options.disabled) return;

    cursorManager.addCursorEvents(element, options.cursor, {
      hotspotX: options.hotspotX,
      hotspotY: options.hotspotY,
      resetOnLeave: options.resetOnLeave
    });

    // Cleanup function
    return () => {
      cursorManager.resetCursor(element);
    };
  }, [options.cursor, options.hotspotX, options.hotspotY, options.resetOnLeave, options.disabled]);

  return elementRef;
}

export function useGlobalCursor() {
  const setCursor = (cursorName: string, hotspotX = 0, hotspotY = 0) => {
    cursorManager.setCursor(null, cursorName, hotspotX, hotspotY);
  };

  const resetCursor = () => {
    cursorManager.resetCursor();
  };

  const getCurrentCursor = () => {
    return cursorManager.getCurrentCursor();
  };

  return {
    setCursor,
    resetCursor,
    getCurrentCursor
  };
} 