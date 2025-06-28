import React from 'react';
import { cn } from '@/lib/utils';

interface DesktopIconProps {
  iconSrc: string;
  label: string;
  onClick: () => void;
  className?: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ iconSrc, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-3 w-24 h-24",
        "text-mac-white text-xs font-sans",
        "hover:bg-mac-medium-gray/30 active:bg-mac-medium-gray/50 rounded-sm",
        "focus:outline-none focus:bg-mac-medium-gray/50"
      )}
    >
      <img src={iconSrc} alt={`${label} icon`} className="w-10 h-10 mb-1 object-contain" style={{ imageRendering: 'pixelated' }} />
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
};

export { DesktopIcon };