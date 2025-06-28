import React, { useState, useEffect } from 'react';
import { Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

interface MenuBarProps {
  onOpenAbout: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onOpenAbout }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time as HH:MM AM/PM, e.g., 03:30 PM
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formattedTime);
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  return (
    <div className={cn(
      "w-full h-6 bg-mac-light-gray mac-border-inset", // Light gray background with inset border for depth
      "flex items-center justify-between px-2 text-mac-black text-xs font-sans",
      "select-none" // Prevent text selection
    )}>
      {/* Left side: Apple logo and menu items */}
      <div className="flex items-center space-x-4 h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Apple size={16} className="text-mac-black cursor-pointer hover:bg-mac-medium-gray/30 rounded-sm p-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mac-border-outset bg-mac-light-gray text-mac-black text-xs">
            <DropdownMenuItem onClick={onOpenAbout} className="cursor-pointer hover:bg-mac-medium-gray">
              About This Mac
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-mac-dark-gray" />
            <DropdownMenuItem className="cursor-not-allowed text-mac-dark-gray">
              System Settings... (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-not-allowed text-mac-dark-gray">
              Restart... (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-not-allowed text-mac-dark-gray">
              Shut Down... (Coming Soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Other static menu items */}
        <span className="font-bold cursor-pointer hover:underline">File</span>
        <span className="font-bold cursor-pointer hover:underline">Edit</span>
        <span className="font-bold cursor-pointer hover:underline">View</span>
        <span className="font-bold cursor-pointer hover:underline">Help</span>
      </div>

      {/* Right side: Time */}
      <div className="flex items-center space-x-2 h-full">
        <span className="font-bold">{currentTime}</span>
      </div>
    </div>
  );
};

export { MenuBar };