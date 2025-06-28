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
    <div className="p-2 font-sans text-mac-black flex flex-col h-full">
      <h2 className="text-lg font-bold mb-4">My Computer</h2>
      <div className="flex-grow overflow-auto mac-border-inset bg-mac-light-gray p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center p-2 cursor-pointer",
                "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm"
              )}
            >
              <item.icon size={32} className="mb-1" />
              <span className="text-center text-sm font-bold leading-tight">{item.label}</span>
              <span className="text-center text-xs text-mac-dark-gray">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-right">
        <PixelButton onClick={onClose} variant="default">Close</PixelButton>
      </div>
    </div>
  );
};

export { MyComputerApp };