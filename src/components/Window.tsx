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
}

const Window: React.FC<WindowProps> = ({ title, children, onClose, initialPosition, className }) => {
  return (
    <Draggable
      handle=".window-header"
      defaultPosition={initialPosition}
      bounds="parent" // Keep window within its parent container
    >
      <div className={cn(
        "absolute bg-emerald-white text-emerald-black pixel-border border-emerald-border pixel-shadow",
        "min-w-[300px] min-h-[200px] flex flex-col",
        className
      )}>
        <div className="window-header flex justify-between items-center bg-emerald-dark-blue text-emerald-white px-2 py-1 cursor-grab pixel-border-inset border-emerald-border">
          <span className="font-pixel text-sm">{title}</span>
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