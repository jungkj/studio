import React from 'react';
import { Folder, Volume2, Trash2, HardDrive, Monitor, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';

const SystemTray: React.FC = () => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "w-full h-8 bg-mac-light-gray mac-border-outset", // Light gray background with outset border
      "flex items-center justify-between px-2 text-mac-black text-xs font-sans",
      "select-none" // Prevent text selection
    )}>
      {/* Left side: System icons */}
      <div className="flex items-center space-x-1 h-full">
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Folder size={16} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <HardDrive size={16} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Monitor size={16} />
        </PixelButton>
        {/* Add more icons as needed, e.g., for network, printer */}
      </div>

      {/* Right side: Volume, Trash, etc. */}
      <div className="flex items-center space-x-1 h-full">
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Volume2 size={16} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Settings size={16} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Trash2 size={16} />
        </PixelButton>
      </div>
    </div>
  );
};

export { SystemTray };