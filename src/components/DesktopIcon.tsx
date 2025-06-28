import React from 'react';
import { cn } from '@/lib/utils';

interface DesktopIconProps {
  icon: React.ElementType; // Lucide icon component
  label: string;
  onClick: () => void;
  className?: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon: Icon, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 w-20 h-20", // Fixed size for consistent icon grid
        "text-mac-black text-xs font-sans",
        "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm", // Subtle hover/active state
        className
      )}
    >
      <Icon size={32} className="mb-1" />
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
};

export { DesktopIcon };