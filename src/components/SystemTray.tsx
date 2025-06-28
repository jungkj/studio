import React from 'react';
import { Folder, Volume2, Trash2, HardDrive, Monitor, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';

const SystemTray: React.FC = () => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "w-full h-7 bg-mac-light-gray mac-border-outset", // Light gray background with outset border, adjusted height
      "flex items-center justify-between px-1 text-mac-black text-xs font-sans", // Adjusted padding
      "select-none" // Prevent text selection
    )}>
      {/* Left side: System icons */}
      <div className="flex items-center space-x-0.5 h-full"> {/* Adjusted space-x */}
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center"> {/* Adjusted size */}
          <Folder size={14} /> {/* Adjusted icon size */}
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <HardDrive size={14} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Monitor size={14} />
        </PixelButton>
        {/* Add more icons as needed, e.g., for network, printer */}
      </div>

      {/* Right side: Volume, Trash, etc. */}
      <div className="flex items-center space-x-0.5 h-full"> {/* Adjusted space-x */}
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Volume2 size={14} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Settings size={14} />
        </PixelButton>
        <PixelButton variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
          <Trash2 size={14} />
        </PixelButton>
      </div>
    </div>
  );
};

export { SystemTray };