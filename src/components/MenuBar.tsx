import React, { useState, useEffect } from 'react';
import { Apple, HelpCircle, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuBarProps {
  onOpenAbout: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onOpenAbout }) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={cn(
      "w-full h-5 bg-mac-light-gray mac-border-inset",
      "flex items-center justify-between px-1 text-mac-black text-xs font-sans",
      "select-none flex-shrink-0"
    )}>
      {/* Left side: Apple logo and menu items */}
      <div className="flex items-center space-x-2 h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer hover:bg-mac-medium-gray/30 rounded-sm p-0.5">
              <Apple size={14} className="text-mac-black" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mac-border-outset bg-mac-light-gray text-mac-black text-xs">
            <DropdownMenuItem onClick={onOpenAbout} className="cursor-pointer hover:bg-mac-medium-gray">
              About This Macintosh
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-mac-dark-gray" />
            <DropdownMenuItem className="cursor-not-allowed text-mac-dark-gray">
              System Settings...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="cursor-pointer hover:underline">File</span>
        <span className="cursor-pointer hover:underline">Edit</span>
        <span className="cursor-pointer hover:underline">View</span>
        <span className="cursor-pointer hover:underline">Label</span>
        <span className="cursor-pointer hover:underline">Special</span>
      </div>

      {/* Right side: Time and icons */}
      <div className="flex items-center space-x-1 h-full">
        <HelpCircle size={14} />
        <Flag size={14} />
        <span className="">{currentTime}</span>
      </div>
    </div>
  );
};

export { MenuBar };