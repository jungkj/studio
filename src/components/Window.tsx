import React, { useRef } from 'react';
import Draggable from 'react-draggable';
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
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-header"
      defaultPosition={initialPosition}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute bg-mac-white text-mac-black mac-border-outset",
          "min-w-[300px] min-h-[200px] flex flex-col",
          className
        )}
        style={{ zIndex }}
        onMouseDown={onFocus}
      >
        <div
          className="window-header flex items-center justify-start bg-mac-medium-gray text-mac-black px-2 py-0.5 cursor-grab mac-border-inset"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, hsla(0,0%,100%,.25), hsla(0,0%,100%,.25) 1px, transparent 1px, transparent 2px)",
            backgroundSize: "100% 2px"
          }}
        >
          <PixelButton onClick={onClose} variant="default" className="w-4 h-4 p-0 flex items-center justify-center" />
          <span className="font-sans text-sm flex-grow text-center pr-4">{title}</span>
        </div>
        <div className="p-2 flex-grow overflow-auto">
          {children}
        </div>
      </div>
    </Draggable>
  );
};

export { Window };