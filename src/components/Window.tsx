import React, { useState, useRef, useEffect } from 'react';
import { X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { designTokens } from '@/utils/designTokens';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
  resizable?: boolean;
  draggable?: boolean;
}

const Window: React.FC<WindowProps> = ({ 
  title, 
  children, 
  onClose, 
  initialPosition = { x: 100, y: 100 }, 
  initialSize = { 
    width: designTokens.window.defaultWidth, 
    height: designTokens.window.defaultHeight 
  },
  className, 
  zIndex = designTokens.zIndex.window, 
  onFocus,
  resizable = true,
  draggable = true
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  // Notify content of size changes using ResizeObserver
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Dispatch a custom event that child components can listen to
        const event = new CustomEvent('windowResize', {
          detail: {
            width: entry.contentRect.width,
            height: entry.contentRect.height
          }
        });
        entry.target.dispatchEvent(event);
      }
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Dynamic title sizing based on available space
  useEffect(() => {
    const updateTitleSize = () => {
      if (titleRef.current && windowRef.current) {
        const titleElement = titleRef.current;
        const availableWidth = size.width - 120; // Account for buttons and padding
        
        // Reset to default size first
        titleElement.style.fontSize = '';
        titleElement.style.transform = '';
        
        const titleWidth = titleElement.scrollWidth;
        
        if (titleWidth > availableWidth) {
          // Calculate scale factor to fit text
          const scaleFactor = Math.max(0.6, availableWidth / titleWidth);
          
          if (scaleFactor < 0.9) {
            // Use CSS transform for smooth scaling
            titleElement.style.transform = `scale(${scaleFactor})`;
            titleElement.style.transformOrigin = 'left center';
          }
        }
      }
    };

    updateTitleSize();
  }, [size.width, title]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent
    onFocus?.(); // Always call focus when clicking title bar
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus?.();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - designTokens.window.titleBarHeight, e.clientY - dragStart.y));
        setPosition({ x: newX, y: newY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(designTokens.window.minWidth, resizeStart.width + deltaX);
        const newHeight = Math.max(designTokens.window.minHeight, resizeStart.height + deltaY);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, size]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={windowRef}
        className={cn(
          "absolute bg-mac-darker-gray mac-border-outset pointer-events-auto flex flex-col",
          // Only apply transitions when NOT dragging or resizing
          !isDragging && !isResizing && "transition-all duration-200 ease-in-out",
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: isMinimized ? designTokens.window.titleBarHeight : size.height,
          zIndex,
        }}
        onMouseDown={onFocus}
      >
        {/* Title Bar */}
        <div
          className={cn(
            "h-8 bg-mac-darker-gray mac-border-inset flex items-center justify-between px-2 text-mac-black font-bold flex-shrink-0",
            draggable && "cursor-move",
            // Remove transitions during dragging for title bar too
            !isDragging && "transition-colors duration-150"
          )}
          onMouseDown={handleMouseDown}
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, hsla(0,0%,100%,.15), hsla(0,0%,100%,.15) 1px, transparent 1px, transparent 2px)",
            backgroundSize: "100% 2px"
          }}
        >
          <div className="flex items-center flex-1 min-w-0 mr-2">
            <span 
              ref={titleRef}
              className="select-none font-bold whitespace-nowrap text-xs"
              style={{ 
                fontFamily: designTokens.typography.fontFamily.system,
                maxWidth: '100%',
                display: 'block',
                overflow: 'hidden'
              }}
            >
              {title}
            </span>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={cn(
                "w-6 h-4 bg-mac-medium-gray text-black text-xs flex items-center justify-center mac-border-outset",
                !isDragging && "hover:bg-mac-dark-gray transition-colors duration-150"
              )}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minus size={10} />
            </button>
            <button
              onClick={onClose}
              className={cn(
                "w-6 h-4 bg-mac-medium-gray text-black text-xs flex items-center justify-center mac-border-outset",
                !isDragging && "hover:bg-mac-dark-gray transition-colors duration-150"
              )}
              title="Close"
            >
              <X size={10} />
            </button>
          </div>
        </div>

        {/* Window Content - Now properly sized */}
        {!isMinimized && (
          <div 
            ref={contentRef}
            className="flex-1 bg-mac-white overflow-hidden relative"
            style={{
              // Ensure content fills remaining space
              height: `calc(100% - ${designTokens.window.titleBarHeight}px)`
            }}
          >
            <div className="absolute inset-0 overflow-auto p-2">
              {children}
            </div>
          </div>
        )}

        {/* Resize Handle - Fixed positioning */}
        {!isMinimized && resizable && (
          <div
            className="absolute cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{
              bottom: 0,
              right: 0,
              width: designTokens.window.resizeHandleSize,
              height: designTokens.window.resizeHandleSize,
              zIndex: 10,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 15H16V16H15V15Z' fill='%23000000'/%3E%3Cpath d='M13 15H14V16H13V15Z' fill='%23000000'/%3E%3Cpath d='M11 15H12V16H11V15Z' fill='%23000000'/%3E%3Cpath d='M15 13H16V14H15V13Z' fill='%23000000'/%3E%3Cpath d='M13 13H14V14H13V13Z' fill='%23000000'/%3E%3Cpath d='M15 11H16V12H15V11Z' fill='%23000000'/%3E%3Cpath d='M9 15H10V16H9V15Z' fill='%23666666'/%3E%3Cpath d='M11 13H12V14H11V13Z' fill='%23666666'/%3E%3Cpath d='M13 11H14V12H13V11Z' fill='%23666666'/%3E%3Cpath d='M15 9H16V10H15V9Z' fill='%23666666'/%3E%3C/svg%3E")`,
              backgroundPosition: 'bottom right',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
    </div>
  );
};

export { Window };