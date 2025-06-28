import React, { useState, useEffect } from 'react';
import { Apple } from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuBar: React.FC = () => {
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
        <Apple size={16} className="text-mac-black cursor-pointer" />
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