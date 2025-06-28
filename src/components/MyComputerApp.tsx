import React from 'react';
import { PixelButton } from './PixelButton';
import { HardDrive, Folder, Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyComputerAppProps {
  onClose: () => void;
}

const MyComputerApp: React.FC<MyComputerAppProps> = ({ onClose }) => {
  const items = [
    { icon: HardDrive, label: 'Macintosh HD', description: 'System Drive' },
    { icon: Folder, label: 'Documents', description: 'User Documents' },
    { icon: Folder, label: 'Applications', description: 'Installed Applications' },
    { icon: Disc, label: 'CD-ROM', description: 'Empty CD-ROM Drive' },
  ];

  return (
    <div className="p-1 font-sans text-mac-black flex flex-col h-full"> {/* Adjusted padding */}
      <h2 className="text-base mb-2">My Computer</h2> {/* Adjusted font size, removed bold */}
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-2"> {/* Adjusted padding */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"> {/* Adjusted gap and columns */}
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center p-1 cursor-pointer", // Adjusted padding
                "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm"
              )}
            >
              <item.icon size={28} className="mb-0.5" /> {/* Adjusted icon size and margin */}
              <span className="text-xs leading-tight">{item.label}</span> {/* Adjusted font size, removed bold */}
              <span className="text-[0.65rem] text-center text-mac-dark-gray">{item.description}</span> {/* Smaller font size */}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-right"> {/* Adjusted margin-top */}
        <PixelButton onClick={onClose} variant="default">Close</PixelButton>
      </div>
    </div>
  );
};

export { MyComputerApp };