import React from 'react';
import Draggable from 'react-draggable';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  className?: string;
  zIndex?: number;
  onFocus?: () => void;
}

const Window: React.FC<WindowProps> = ({ title, children, onClose, initialPosition, className, zIndex = 1, onFocus }) => {
  return (
    <Draggable
      handle=".window-header"
      defaultPosition={initialPosition}
      bounds="parent" // Keep window within its parent container
    >
      <div
        className={cn(
          "absolute bg-mac-white text-mac-black mac-border-outset", // Apply macOS white background and outset border
          "min-w-[300px] min-h-[200px] flex flex-col",
          className
        )}
        style={{ zIndex }}
        onMouseDown={onFocus}
      >
        <div className="window-header flex justify-between items-center bg-mac-medium-gray text-mac-black px-2 py-1 cursor-grab mac-border-inset"> {/* macOS title bar style */}
          <span className="font-sans text-sm font-bold">{title}</span> {/* Use system font for title */}
          <PixelButton onClick={onClose} variant="danger" className="w-6 h-6 p-0 flex items-center justify-center">
            <X size={16} />
          </PixelButton>
        </div>
        <div className="p-4 flex-grow overflow-auto">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export { Window };